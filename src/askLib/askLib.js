// @flow

import type { BuyOrder } from '../types/buyOrder'
import type { SellOrder } from '../types/sellOrder'
import type { Order, OrderBook } from '../types/orderBook'

import type { Option } from '../types/option'

import Cobinhood from 'cobinhood-api-node'
import colors from 'colors/safe'
import utils from '../utils'
import store from '../store'
import lib from '../lib'
import logger from '../helpers/logger'

// export const api = Cobinhood({apiSecret: config.apiSecret})

export const verifyConfig = async (option: Option) => {
  await lib.commonVerifyConfig(option)

  // BOT_SELL_ORDER_ID
  lib.verifyConfigFactory({ env: 'BOT_SELL_ORDER_ID', attr: 'sellOrderId', option })
  /**
   * Check ENV ASK required
   */
  if (!option.productCost) throw new Error('Please setup BOT_PRODUCT_COST')

  /**
   * Verify Done
   */
  logger.info(
    `Setting mode: ${option.mode}, asset: ${option.assetType}, product: ${
      option.productType
    }, profit limit: ${option.profitLimitPercentage}%`,
  )
  return 'SUCCESS'
}

/**
 * @param {Object} payload
 */

export const getAboveCostSellOrder = ({
  asks,
  productCost,
}: {
  asks: Array<Order>,
  productCost: number,
}) => {
  const newAsks = asks.filter(a => parseFloat(a.price) > parseFloat(productCost))
  return newAsks.sort(utils.sortOrder)
}
/**
 * isHighestAskOrder
 */
export const isLowestAskOrder = ({ asks }: { asks: Array<Order> }) => {
  const { sellOrder } = store.getState()
  if (sellOrder.side !== 'ask') throw new Error('This order side is not ask, something wrong here')
  return isLowestAskOrderFactory({ asks, sellOrder })
}

export const isLowestAskOrderFactory = ({
  asks,
  sellOrder,
}: {
  asks: Array<Order>,
  sellOrder: SellOrder,
}) => {
  if (!sellOrder) throw new Error('Sell order is null')
  const left = asks.filter(item => parseFloat(item.price) <= parseFloat(sellOrder.price))
  if (left.length === 0)
    throw new Error('sell order list size is 0, unknown error plz contact bot author')
  const newLeft = left.sort(utils.sortOrder)
  const smallest = newLeft[0]
  const size = utils.minus(sellOrder.size, sellOrder.filled)
  if (
    parseFloat(smallest.price) === parseFloat(sellOrder.price) &&
    parseFloat(smallest.size) === parseFloat(size)
  )
    return true
  return false
}

/**
 * @param {Object} payload
 */
export const isGainPrice = ({ asks, decrement }: { asks: Array<Order>, decrement: number }) => {
  const { sellOrder } = store.getState()
  return isGainPriceFactory({ asks, sellOrder, decrement })
}

export const isGainPriceFactory = ({
  asks,
  sellOrder,
  decrement,
}: {
  asks: Array<Order>,
  sellOrder: SellOrder,
  decrement: number,
}) => {
  if (!sellOrder) throw new Error('Sell Order is null')
  const secAsk = asks.sort(utils.sortOrder)[1]
  if (utils.minus(secAsk.price, decrement) === parseFloat(sellOrder.price)) return false
  return true
}

export const getLastPrice = ({ asks, decrement }: { asks: Array<Order>, decrement: number }) => {
  const newAsks = asks.sort(utils.sortOrder)[0]
  return utils.minus(newAsks.price, decrement)
}
/**
 * Check price is under cost or not
 */
export const checkUnderCost = ({ price, productCost }: { price: number, productCost: number }) => {
  if (parseFloat(price) < parseFloat(productCost))
    throw new Error('Under cost price but not detected, plz contact the bot author')
}

/**
 * get Gained price
 *
 */

export const getGainedPrice = ({ asks, decrement }: { asks: Array<Order>, decrement: number }) => {
  const secAsk = asks.sort(utils.sortOrder)[1]
  return utils.minus(secAsk.price, decrement)
}

export const getLimitProfitSellOrderFy = ({
  asks,
  productCost,
  profitLimitPercentage,
}: {
  asks: Array<Order>,
  productCost: number,
  profitLimitPercentage: number,
}) => {
  const newAsks = asks.filter(a => {
    return lib.getProfitPercentage({ price: a.price, productCost }) > profitLimitPercentage
  })
  return newAsks
}

export const getLimitProfitSellOrder = ({
  asks,
  productCost,
  profitLimitPercentage,
}: {
  asks: Array<Order>,
  productCost: number,
  profitLimitPercentage: number,
}) => {
  return getLimitProfitSellOrderFy({
    asks,
    productCost: parseFloat(productCost),
    profitLimitPercentage: parseFloat(profitLimitPercentage),
  })
}

export const inAskPriceBucket = ({
  asks,
  sellOrder,
}: {
  asks: Array<Order>,
  sellOrder: SellOrder,
}) => {
  if (!sellOrder) throw new Error('Sell Order is null')
  const askPrice = asks.map(a => parseFloat(a.price))
  if (askPrice.includes(parseFloat(sellOrder.price))) return true
  return false
}

export const getValidQuantityCompareFy = ({
  asks,
  sellOrder,
  quantityComparePercentage,
}: {
  asks: Array<Order>,
  sellOrder: SellOrder,
  quantityComparePercentage: number,
}) => {
  if (!sellOrder) throw new Error('Sell Order is null')
  const temp = JSON.parse(JSON.stringify(asks))
  const asksA = temp.sort(utils.sortOrder).reverse()
  const asksB = asksA.filter(a => a.price < sellOrder.price)

  let acc = 0
  const asksC = asksB.map(c => {
    acc += c.size
    // accumulation percentage
    const accp = parseFloat(utils.div(acc, sellOrder.size))
    return Object.assign(c, { accp })
  })
  const asksD = asksC.filter(d => d.accp < utils.div(quantityComparePercentage, 100))
  const newAsks = asks.filter(na => {
    const ans = asksD.filter(e => e.price === na.price)
    return ans.length === 0
  })
  return newAsks
}

export const getValidQuantityCompare = ({
  asks,
  sellOrder,
  quantityComparePercentage,
}: {
  asks: Array<Order>,
  sellOrder: SellOrder,
  quantityComparePercentage: number,
}) => {
  return getValidQuantityCompareFy({ asks, sellOrder, quantityComparePercentage })
}
