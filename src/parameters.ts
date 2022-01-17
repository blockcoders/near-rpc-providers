import { BlockTag } from '@ethersproject/providers'

export interface Request {
  method: string
  params: any[] | Record<string, any>
  id: number
  jsonrpc: string
}

export type Finality = 'final' | 'optimistic'
interface Params {
  finality?: Finality
  block_id?: BlockTag
}

interface CommonParams extends Params {
  account_id: string
}
export interface GetBalanceParams {
  request_type: 'view_account'
  finality: Finality
  account_id: string
}
export interface GetCodeParams extends CommonParams {
  request_type: 'view_code'
}

export type GetBlockDetailsParams = Params

export interface GetChunkDetailsParams {
  chunk_id?: string
  block_id?: BlockTag
  shard_id?: number
}

export interface GetStateParams extends CommonParams {
  request_type: 'view_state'
  prefix_base64: string
}

export interface GetAccessKeyListParams extends CommonParams {
  request_type: 'view_access_key_list'
}

export interface GetAccessKeyParams extends CommonParams {
  request_type: 'view_access_key'
  public_key: string
}

export interface GetContractCall extends CommonParams {
  request_type: 'call_function'
  method_name: string
  args_base64: string
}
