export type Finality = 'final' | 'optimistic'

export interface GetBalanceParams {
  request_type: 'view_account'
  finality: Finality
  account_id: string
}

export function validateGetBalanceParams(params: Record<string, any>): params is GetBalanceParams {
  if (params.request_type !== 'view_account') throw new Error("request_type must be 'view_account'")
  if (typeof params.account_id !== 'string') throw new Error('account_id must be a string')
  if (params.finality !== 'final' && params.finality !== 'optimistic')
    throw new Error("finality must be a 'final' or 'optimistic'")
  return true
}
