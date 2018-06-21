// @flow
import { sortOrder } from '../utils/utils'
import logger from '../helpers/winston'
import type { OrderBook, AllOrderBookActions, Order } from '../types/orderBook'
import { SET_ORDER_BOOK, UPDATE_ORDER_BOOK } from '../types/orderBook'

export function orderBookReducer(state: OrderBook = null, action: AllOrderBookActions) {
  switch (action.type) {
  case SET_ORDER_BOOK: {
    logger.debug('[Redux][orderBookReducer] SET_ORDER_BOOK')
    return action.payload
  }
  case UPDATE_ORDER_BOOK: {
    logger.debug(
      `[Redux][orderBookReducer] UPDATE_ORDER_BOOK-payload ${JSON.stringify(action.payload)}`,
    )
    return orderBookMaker({ state, orderBook: action.payload })
  }
  default:
    return state
  }
}

export const ordersMaker = ({
  orders,
  uOrders,
}: {
  orders: Array<Order>,
  uOrders: Array<Order>,
}): Array<Order> => {
  let newOrders = []
  let flag = null
  if (uOrders.length === 0) return orders

  for (let item of orders) {
    for (let j of uOrders) {
      if (item.price === j.price) {
        const count = item.count + j.count
        const size = item.size + j.size
        if (count !== 0) newOrders.push(Object.assign({}, { price: item.price, count, size }))
        flag = 'DONE'
      } else {
        newOrders.push(item)
      }
    }
  }
  if (flag === null) newOrders.push(uOrders[0])
  return newOrders
}

export const orderBookMaker = ({
  state,
  orderBook,
}: {
  state: OrderBook,
  orderBook: OrderBook,
}): OrderBook => {
  if (state === null) throw new Error('state OrderBook is null')
  if (orderBook === null) throw new Error('OrderBook is null')
  const { asks, bids } = state
  const { asks: uAsks, bids: uBids } = orderBook
  const newAsks = ordersMaker({ orders: asks, uOrders: uAsks })
  newAsks.sort(sortOrder)
  const newBids = ordersMaker({ orders: bids, uOrders: uBids })
  newBids.sort(sortOrder).reverse()
  return Object.assign({}, { asks: newAsks, bids: newBids })
}
