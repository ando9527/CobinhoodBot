// @flow

export const UPDATE_SELL_ORDER = 'UPDATE_SELL_ORDER'

export type SellOrder = {
  id: string,
  trading_pair_id: string,
  side: string,
  type: string,
  price: number,
  size: number,
  filled: number,
  state: string,
  timestamp: string,
  eq_price: number,
  completed_at?: string,
} | null

export type OnSellOrderUpdateAction = {
  type: string,
  payload: SellOrder,
}

// {
//     "id": "72be5846-bbe7-4f30-a475-4ed9d0356c87",
//     "trading_pair_id": "SMT-ETH",
//     "side": "bid",
//     "type": "limit",
//     "price": 0.0000252,
//     "size": 7000,
//     "filled": 0,
//     "state": "open",
//     "timestamp": 1528684650200,
//     "eq_price": 0,
//     "completed_at": null
// }
