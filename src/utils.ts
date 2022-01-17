import { RpcError } from './near-rpc-provider'

interface HandlerError {
  name: 'HANDLER_ERROR'
  cause: {
    name: 'UNKNOWN_BLOCK' | 'UNKNOWN_TRANSACTION'
  }
  code: number
}
export const errorIsHandlerError = (error: unknown): error is HandlerError => {
  const rpcError = error as RpcError
  if (!rpcError) return false

  return (
    rpcError.type === 'HANDLER_ERROR' &&
    (rpcError.cause?.name === 'UNKNOWN_BLOCK' || rpcError.cause?.name === 'UNKNOWN_TRANSACTION')
  )
}

type AnyFn = (...any: any[]) => any
type Awaited<T> = T extends PromiseLike<infer U> ? U : T
type DelayFn = (retry: number) => number

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function retry<Fn extends AnyFn>(fn: Fn, maxRetries: number, getDelay: DelayFn = () => 5000) {
  let retries = 0

  return async function wrapped(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    try {
      return await fn(...args)
    } catch (e) {
      if (++retries > maxRetries) throw e

      const delayTime = getDelay(retries)
      await delay(delayTime)
      return await wrapped(...args)
    }
  }
}
