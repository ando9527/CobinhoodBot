// @flow
import type { OrderBook, UpdateOrderBookAction, SetOrderBookAction } from '../types/orderBook'

export const setOrderBook = ({ payload }: { payload: OrderBook }): SetOrderBookAction => {
  return { type: 'SET_ORDER_BOOK', payload }
}

export const updateOrderBook = ({ payload }: { payload: OrderBook }): UpdateOrderBookAction => {
  return { type: 'UPDATE_ORDER_BOOK', payload }
}
