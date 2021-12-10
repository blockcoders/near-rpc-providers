export type Finality = 'final' | 'optimistic'

export interface GetBalanceParams {
  request_type: 'view_account'
  finality: Finality
  account_id: string
}
