// @flow

export const SET_ORDER_BOOK = "SET_ORDER_BOOK"
export const UPDATE_ORDER_BOOK= "UPDATE_ORDER_BOOK"

export type Order={price:number, count: number, size: number}
export type OrderBook={
  asks:Array<Order>,
  bids:Array<Order>,
} | null

export type SetOrderBookAction={
  type: string,
  payload: OrderBook,
}

export type UpdateOrderBookAction={
  type: string,
  payload: OrderBook,
}

export type AllOrderBookActions = SetOrderBookAction | UpdateOrderBookAction