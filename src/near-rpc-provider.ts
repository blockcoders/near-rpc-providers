import { BigNumber } from '@ethersproject/bignumber'
import { Logger } from '@ethersproject/logger'
import { deepCopy, getStatic } from '@ethersproject/properties'
import { BlockTag, Block, JsonRpcProvider, Network, Networkish } from '@ethersproject/providers'
import { fetchJson } from '@ethersproject/web'
import { logger } from './logger'
import { getNetwork } from './networks'
import { GetBalanceParams, GetCodeParams } from './parameters'
import {
  BlockRpcResponse,
  GenesisConfigRpcResponse,
  GetBalanceRpcResponse,
  RpcResponse,
  StatusRpcResponse,
  GetLastGasPriceRpcResponse,
  GetCodeRpcResponse,
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
      case 'getBlock':
        return this._internalGetBlock(params)
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

  async _getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block> {
    blockHashOrBlockTag = await blockHashOrBlockTag
    const block = await this.perform('getBlock', { block_id: blockHashOrBlockTag })
    return block
  }

  private async _internalGetBlock(params: Record<string, any>): Promise<Block> {
    const blockResponse = await this.send<BlockRpcResponse>('block', { block_id: params.block_id })

    return {
      hash: blockResponse.header.hash,
      parentHash: blockResponse.header.prev_hash,
      number: blockResponse.header.height,
      timestamp: blockResponse.header.timestamp,
      // TODO: starting from here, are these values correct?
      nonce: blockResponse.header.random_value,
      difficulty: 0,
      _difficulty: BigNumber.from(0),
      transactions: [],
      gasLimit: BigNumber.from(Math.max(...blockResponse.chunks.map((chunk) => chunk.gas_limit))),
      gasUsed: BigNumber.from(Math.max(...blockResponse.chunks.map((chunk) => chunk.gas_used))),
      miner: blockResponse.author,
      extraData: '',
    }
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

  async getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
    const getCodeParams: GetCodeParams = {
      request_type: 'view_code',
      account_id: addressOrName,
    }
    try {
      if (blockTag === 'latest') {
        getCodeParams.finality = 'final'
      } else {
        getCodeParams.block_id = blockTag
      }
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
}
