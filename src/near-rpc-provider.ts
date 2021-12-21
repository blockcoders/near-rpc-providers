import { BigNumber } from '@ethersproject/bignumber'
import { Logger } from '@ethersproject/logger'
import { deepCopy, getStatic } from '@ethersproject/properties'
import {
  BlockTag,
  JsonRpcProvider,
  Network,
  Networkish,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers'
import { fetchJson } from '@ethersproject/web'
import { SignedTransaction } from 'near-api-js/lib/transaction'
import { logger } from './logger'
import { getNetwork } from './networks'
import {
  GetBalanceParams,
  GetCodeParams,
  GetChunkDetailsParams,
  GetStateParams,
  GetBlockDetailsParams,
} from './parameters'
import {
  BlockRpcResponse,
  GenesisConfigRpcResponse,
  GetBalanceRpcResponse,
  RpcResponse,
  StatusRpcResponse,
  GetLastGasPriceRpcResponse,
  GetCodeRpcResponse,
  GetTransactionStatusRpcResponse,
  NearBlockWithChunk,
  NearChunkDetailsResponse,
  GetStateResponse,
} from './responses'

export class RpcError extends Error {
  public readonly type: string
  public readonly code: number
  public readonly data: string

  constructor(message: string, type: string, code: number, data: string) {
    super(message)
    this.name = RpcError.name
    this.type = type
    this.code = code
    this.data = data

    Error.captureStackTrace(this, this.constructor)
  }
}

function getResult(payload: RpcResponse): any {
  if (payload.error) {
    throw new RpcError(payload.error.message, payload.error.name, payload.error.code, payload.error.data)
  }

  return payload.result
}

export class NearRpcProvider extends JsonRpcProvider {
  constructor(_network?: Networkish) {
    const network = getNetwork(_network)
    const baseUrl = getStatic<(network?: Network | null) => string>(new.target, 'getBaseUrl')(network)

    super(baseUrl, network)

    this._nextId = 52
  }

  static defaultUrl(): string {
    return 'http://localhost:3030'
  }

  static getBaseUrl(network?: Network | null): string {
    switch (network ? network.name : 'invalid') {
      case 'near':
        return 'https://rpc.mainnet.near.org'
      case 'neartestnet':
        return 'https://rpc.testnet.near.org'
      case 'nearbetanet':
        return 'https://rpc.betanet.near.org'
    }

    return logger.throwArgumentError('unsupported network', 'network', network)
  }

  getNextId(): number {
    this._nextId += 1

    return this._nextId
  }

  async _uncachedDetectNetwork(): Promise<Network> {
    let chainId = null

    try {
      const statusResponse = await this.send<StatusRpcResponse>('status', {})

      chainId = statusResponse.chain_id
    } catch (error) {
      try {
        const configResponse = await this.send<GenesisConfigRpcResponse>('EXPERIMENTAL_genesis_config', {})
        chainId = configResponse.chain_id
      } catch (error) {
        return logger.throwError('could not detect network', Logger.errors.NETWORK_ERROR, {
          chainId: chainId,
          event: 'invalidNetwork',
          serverError: error,
        })
      }
    }

    if (chainId !== null) {
      try {
        const network = getNetwork(parseInt(Buffer.from(chainId).toString('hex'), 16))

        if (!network) {
          throw new Error(`Invalid network chainId ${chainId}`)
        }

        return network
      } catch (error) {
        return logger.throwError('could not detect network', Logger.errors.NETWORK_ERROR, {
          chainId: chainId,
          event: 'invalidNetwork',
          serverError: error,
        })
      }
    }

    return logger.throwError('could not detect network', Logger.errors.NETWORK_ERROR, {
      event: 'noNetwork',
    })
  }

  async send<T>(method: string, params: Record<string, any> | any[]): Promise<T> {
    const request = {
      method: method,
      params: params,
      id: this.getNextId(),
      jsonrpc: '2.0',
    }

    this.emit('debug', {
      action: 'request',
      request: deepCopy(request),
      provider: this,
    })

    const cache = ['status', 'EXPERIMENTAL_genesis_config', 'block'].indexOf(method) >= 0
    if (cache && this._cache[method]) {
      return this._cache[method]
    }

    try {
      const result = await fetchJson(this.connection, JSON.stringify(request), getResult)

      this.emit('debug', {
        action: 'response',
        request: request,
        response: result,
        provider: this,
      })

      // Cache the fetch, but clear it on the next event loop
      if (cache) {
        this._cache[method] = result
        setTimeout(() => {
          this._eventLoopCache = {}
        }, 0)
      }

      return result as T
    } catch (err) {
      this.emit('debug', {
        action: 'response',
        error: err,
        request: request,
        provider: this,
      })

      throw err
    }
  }

  async perform(method: string, params: Record<string, any>): Promise<any> {
    switch (method) {
      case 'getBlockNumber':
        const blockResponse = await this.send<BlockRpcResponse>('block', { finality: 'final' })
        return blockResponse.header.height
      case 'getBalance':
        return this._internalGetBalance(params)
      case 'getGasPrice':
        const gasResponse = await this.send<GetLastGasPriceRpcResponse>('gas_price', [null])
        return gasResponse.gas_price
      default:
        return super.perform(method, params)
    }
  }

  _getAddress(addressOrName: string | Promise<string>): Promise<string> {
    return Promise.resolve(addressOrName)
  }

  async status() {
    const statusResponse = await this.send<StatusRpcResponse>('status', {})
    return statusResponse
  }

  async getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>) {
    return logger.throwError(
      'getBlock function is not supported in Near Provider. Please use getBlockWithChunk function',
      Logger.errors.SERVER_ERROR,
      {
        method: 'getBlock',
        params: blockHashOrBlockTag,
      },
    )
  }

  async sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
    const network = await this.getNetwork()
    const signed = await signedTransaction
    const response = await this.send<string>('broadcast_tx_async', [signed])
    const tx = this._decodeTransaction(signed)
    const blockNumber = await this.getBlockNumber()
    return {
      hash: response,
      from: tx.transaction.signerId,
      nonce: tx.transaction.nonce,
      confirmations: 0,
      data: JSON.stringify(tx.transaction.actions),
      gasLimit: BigNumber.from(0),
      value: BigNumber.from(0),
      chainId: network.chainId,
      wait: async () => {
        const txStatus = await this._internalGetTransactionStatus(response, tx.transaction.signerId)

        return {
          blockHash: txStatus.transaction_outcome.block_hash,
          blockNumber,
          from: tx.transaction.signerId,
          to: tx.transaction.receiverId,
          transactionHash: response,
          confirmations: txStatus.receipts_outcome.length,
          gasUsed: txStatus.transaction_outcome.outcome.gas_burnt,
          status: txStatus.status.SuccessValue,
        } as unknown as TransactionReceipt
      },
    }
  }

  private async _internalGetTransactionStatus(txHash: string, accountId: string) {
    // TODO: Query the archival node as well.
    const result = await this.send<GetTransactionStatusRpcResponse>('tx', [txHash, accountId])
    return result
  }

  private _decodeTransaction(signedTransaction: string): SignedTransaction {
    return SignedTransaction.decode(Buffer.from(signedTransaction, 'base64'))
  }

  private async _internalGetBalance(params: Record<string, any>): Promise<BigNumber> {
    const getBalanceParams: GetBalanceParams = {
      request_type: 'view_account' as const,
      finality: 'final' as const,
      account_id: params.address,
    }

    const balanceResponse = await this.send<GetBalanceRpcResponse>('query', getBalanceParams)

    try {
      return BigNumber.from(balanceResponse.amount)
    } catch (error) {
      return logger.throwError('bad result from backend', Logger.errors.SERVER_ERROR, {
        method: 'getBalance',
        params: getBalanceParams,
        result: balanceResponse,
        error,
      })
    }
  }

  private _setParamsFinalityOrBlockId(params: any, blockTag: BlockTag) {
    if (blockTag === 'latest') {
      params.finality = 'final'
    } else {
      params.block_id = blockTag
    }
    return params
  }

  async getCode(addressOrName: string | Promise<string>, blockTag: BlockTag): Promise<string> {
    let getCodeParams: GetCodeParams = {
      request_type: 'view_code',
      account_id: addressOrName,
    }
    try {
      getCodeParams = this._setParamsFinalityOrBlockId(getCodeParams, blockTag)
      const codeResponse = await this.send<GetCodeRpcResponse>('query', getCodeParams)
      return codeResponse.code_base64
    } catch (error) {
      return logger.throwError('bad result from backend', Logger.errors.SERVER_ERROR, {
        method: 'getCode',
        params: getCodeParams,
        error,
      })
    }
  }

  async getBlockWithChunk(params: Record<string, any>): Promise<NearBlockWithChunk> {
    const getBlockDetailsParams: GetBlockDetailsParams = {}
    try {
      if (params.finality) {
        getBlockDetailsParams.finality = params.finality
      }

      if (params.block_id) {
        getBlockDetailsParams.block_id = params.block_id
      }

      const chunkResponse = await this.send<NearBlockWithChunk>('block', getBlockDetailsParams)
      return chunkResponse
    } catch (error) {
      return logger.throwError('bad result from backend', Logger.errors.SERVER_ERROR, {
        method: 'getBlockWithChunk',
        params: getBlockDetailsParams,
        error,
      })
    }
  }

  async getChunkDetails(params: Record<string, any>): Promise<NearChunkDetailsResponse> {
    const getChunkDetailsParams: GetChunkDetailsParams = {}
    try {
      if (params.chunk_id) {
        getChunkDetailsParams.chunk_id = params.chunk_id
      }

      if (params.block_id && params.shard_id) {
        getChunkDetailsParams.block_id = params.block_id
        getChunkDetailsParams.shard_id = params.shard_id
      }

      const chunkResponse = await this.send<NearChunkDetailsResponse>('chunk', getChunkDetailsParams)
      return chunkResponse
    } catch (error) {
      return logger.throwError('bad result from backend', Logger.errors.SERVER_ERROR, {
        method: 'getChunkDetails',
        params: getChunkDetailsParams,
        error,
      })
    }
  }

  async getContractState(addressOrName: string, blockTag: BlockTag) {
    let getStateParams: GetStateParams = {
      request_type: 'view_state',
      account_id: addressOrName,
      prefix_base64: '',
    }
    try {
      getStateParams = this._setParamsFinalityOrBlockId(getStateParams, blockTag)
      const stateResponse = await this.send<GetStateResponse>('query', getStateParams)
      return stateResponse
    } catch (error) {
      return logger.throwError('bad result from backend', Logger.errors.SERVER_ERROR, {
        method: 'getContractState',
        params: getStateParams,
        error,
      })
    }
  }
}
