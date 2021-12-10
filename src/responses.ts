export interface RpcResponse {
  jsonrpc: string
  id: string
  result?: Record<string, any>
  error?: {
    name: string
    code: number
    message: string
    data: string
    cause: {
      name: string
      info: Record<string, any>
    }
  }
}

export interface BlockRpcResponse {
  header: {
    height: number
  }
}

export interface StatusRpcResponse {
  chain_id: string
}

export interface GenesisConfigRpcResponse {
  chain_id: string
}

export interface GetBalanceRpcResponse {
  amount: string
}
