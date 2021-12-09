import { Logger } from '@ethersproject/logger'
import { deepCopy, getStatic } from '@ethersproject/properties'
import { JsonRpcProvider, Network, Networkish } from '@ethersproject/providers'
import { fetchJson } from '@ethersproject/web'
import { logger } from './logger'
import { getNetwork } from './networks'
import { BlockRpcResponse, GenesisConfigRpcResponse, RpcResponse, StatusRpcResponse } from './responses'

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
      case 'near-mainnet':
        return 'https://rpc.mainnet.near.org'
      case 'near-testnet':
        return 'https://rpc.testnet.near.org'
      case 'near-betanet':
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
      } catch (error) {}
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

  async send<T>(method: string, params: Record<string, any>): Promise<T> {
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
      default:
        return super.perform(method, params)
    }
  }
}
