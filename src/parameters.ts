import { BlockTag } from '@ethersproject/providers'

export type Finality = 'final' | 'optimistic'

export interface GetBalanceParams {
  request_type: 'view_account'
  finality: Finality
  account_id: string
}
export interface GetCodeParams {
  request_type: 'view_code'
  finality?: Finality
  block_id?: BlockTag
  account_id: string | Promise<string>
}

export interface GetBlockDetailsParams {
  finality?: Finality
  block_id?: BlockTag
}

export interface GetChunkDetailsParams {
  chunk_id?: string
  block_id?: BlockTag
  shard_id?: number
}

export interface GetStateParams {
  request_type: 'view_state'
  finality?: Finality
  block_id?: BlockTag
  account_id: string
  prefix_base64: string
}
