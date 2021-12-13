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
  author: string
  header: {
    height: number
    epoch_id: string
    next_epoch_id: string
    hash: string
    prev_hash: string
    prev_state_root: string
    chunk_receipts_root: string
    chunk_headers_root: string
    chunk_tx_root: string
    outcome_root: string
    chunks_included: number
    challenges_root: string
    timestamp: number
    timestamp_nanosec: string
    random_value: string
    validator_proposals: any[]
    chunk_mask: boolean[]
    gas_price: string
    rent_paid: string
    validator_reward: string
    total_supply: string
    challenges_result: any[]
    last_final_block: string
    last_ds_final_block: string
    next_bp_hash: string
    block_merkle_root: string
    block_ordinal: number
    approvals: (string | null)[]
    signature: string
    latest_protocol_version: number
  }
  chunks: {
    chunk_hash: string
    gas_used: number
    gas_limit: number
  }[]
}

export interface StatusRpcResponse {
  chain_id: string
  sync_info: {
    latest_block_hash: string
    latest_block_height: number
    latest_state_root: string
    latest_block_time: string
    syncing: boolean
    earliest_block_hash: string
    earliest_block_height: number
    earliest_block_time: string
  }
}

export interface GenesisConfigRpcResponse {
  chain_id: string
}

export interface GetBalanceRpcResponse {
  amount: string
}

export interface GetLastGasPriceRpcResponse {
  gas_price: string
}

export interface GetCodeRpcResponse {
  code_base64: string
}
