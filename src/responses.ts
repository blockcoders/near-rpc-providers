import { BigNumber } from '@ethersproject/bignumber'

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

export interface GetTransactionStatusRpcResponse {
  status: {
    SuccessValue: string
  }
  transaction_outcome: {
    block_hash: string
    outcome: {
      gas_burnt: number
    }
  }
  receipts_outcome: any[]
}

export interface NearBlock {
  hash: string
  parentHash: string
  number: number

  timestamp: number
  nonce: string
  difficulty: number
  _difficulty: BigNumber

  gasLimit: BigNumber
  gasUsed: BigNumber

  miner: string
  extraData: string

  baseFeePerGas?: null | BigNumber
}

export interface NearBlockWithChunk
  extends Pick<NearBlock, 'gasLimit' & 'gasUsed' & 'hash' & 'parentHash' & 'number' & 'timestamp'> {
  result: {
    header: {
      chunk_hash: string
      prev_block_hash: string
      outcome_root: string
      prev_state_root: string
      encoded_merkle_root: string
      encoded_length: number
      height_created: number
      height_included: number
      shard_id: number
      rent_paid: string
      validator_reward: string
      balance_burnt: string
      outgoing_receipts_root: string
      tx_root: string
      validator_proposals: any[]
      signature: string
    }
    transactions: any[]
    receipts: any[]
  }
}

export interface GetBlockWithChunkRpcResponse extends NearBlockWithChunk {
  id: string
}
