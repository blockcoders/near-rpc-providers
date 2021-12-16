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
  block_id?: BlockTag | Promise<BlockTag>
  account_id: string | Promise<string>
}

export interface GetBlockChunkParams {
  chunk_id?: string
  block_id?: string | number
  shard_id?: number
}
