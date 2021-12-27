import { BlockTag } from '@ethersproject/providers'

export type Finality = 'final' | 'optimistic'
interface Params {
  finality?: Finality
  block_id?: BlockTag
}
export interface GetBalanceParams {
  request_type: 'view_account'
  finality: Finality
  account_id: string
}
export interface GetCodeParams extends Params {
  request_type: 'view_code'
  finality?: Finality
  block_id?: BlockTag
  account_id: string
}

export type GetBlockDetailsParams = Params

export interface GetChunkDetailsParams {
  chunk_id?: string
  block_id?: BlockTag
  shard_id?: number
}

export interface GetStateParams extends Params {
  request_type: 'view_state'
  account_id: string
  prefix_base64: string
}

export interface GetAccessKeyParams extends Params {
  request_type: 'view_access_key'
  account_id: string
  public_key: string
}
