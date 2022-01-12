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
