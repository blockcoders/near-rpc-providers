import { Block } from '@ethersproject/abstract-provider'
import { Chunk, Transaction } from 'near-api-js/lib/providers/provider'
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

export interface NearBlock
  extends Pick<Block, 'hash' | 'parentHash' | 'number' | 'timestamp' | 'nonce' | 'miner' | 'gasLimit' | 'gasUsed'> {
  author: string
  header: {
    height: number
    epoch_id: string
    next_epoch_id: string
    prev_state_root: string
    chunk_receipts_root: string
    chunk_headers_root: string
    chunk_tx_root: string
    outcome_root: string
    chunks_included: number
    challenges_root: string
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
    approvals: any[]
    signature: string
    latest_protocol_version: number
  }
  id: string
}

export interface NearBlockWithChunk extends NearBlock {
  chunks: Chunk[]
}

export interface NearChunkDetails
  extends Pick<Block, 'hash' | 'parentHash' | 'number' | 'timestamp' | 'nonce' | 'miner' | 'gasLimit' | 'gasUsed'> {
  author: string
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
  transactions: Transaction[]
  receipts: any[]
  id: string
}

export interface NearChunkDetailsResponse extends NearChunkDetails {
  id: string
}

export interface GetStateResponse {
  values: [
    {
      key: string
      value: string
      proof: []
    },
  ]
  proof: any[]
  block_height: number
  block_hash: string
  id: string
}

export interface GetValidatorStatusResponse {
  current_validators: [
    {
      account_id: string
      public_key: string
      is_slashed: boolean
      stake: string
      shards: number[]
      num_produced_blocks: number
      num_expected_blocks: number
    },
  ]
  next_validators: [
    {
      account_id: string
      public_key: string
      stake: string
      shards: number[]
    },
  ]
  current_fishermen: [
    {
      account_id: string
      public_key: string
      stake: string
    },
  ]
  next_fishermen: [
    {
      account_id: string
      public_key: string
      stake: string
    },
  ]
  current_proposals: [
    {
      account_id: string
      public_key: string
      stake: string
    },
  ]
  prev_epoch_kickout: any[]
  epoch_start_height: number
  epoch_height: number
}

export interface GetNetworkInfoResponse {
  active_peers: [
    {
      id: string
      addr: string
      account_id: null
    },
  ]
  num_active_peers: number
  peer_max_count: number
  sent_bytes_per_sec: number
  received_bytes_per_sec: number
  known_producers: [
    {
      account_id: string
      addr: null
      peer_id: string
    },
  ]
  id: string
}

export interface GetAccessKeyListResponse {
  keys: [
    {
      public_key: string
      access_key: {
        nonce: number
        permission: {
          FunctionCall: {
            allowance: string
            receiver_id: string
            method_names: string[]
          }
        }
      }
    },
  ]
  block_height: number
  block_hash: string
}

export interface GetAccessKeyResponse {
  nonce: number
  permission: {
    FunctionCall: {
      allowance: string
      receiver_id: string
      method_names: string[]
    }
  }
  block_height: number
  block_hash: string
}
