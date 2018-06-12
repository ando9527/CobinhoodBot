// @flow
import Cobinhood from 'cobinhood-api-node'
import config from '../config'
import colors from 'colors/safe'
import utils from '../utils'
import store from '../store'
import lib from '../lib'
import logger from '../utils/winston'
import type { BuyOrder } from '../types/buyOrder'
import type { SellOrder } from '../types/sellOrder'
import type { Order } from '../types/orderBook'

export const api = Cobinhood({
  apiSecret: config.apiSecret,
})

/**
 * Check ENV BID required
 */
export const verifyConfig = async () => {
  await lib.commonVerifyConfig()
  // BOT_BUY_ORDER_ID
  lib.verifyConfigFactory({ env: 'BOT_BUY_ORDER_ID', attr: 'buyOrderId' })
  // BOT_TOTAL_PRICE_LIMIT

  /**
   * check api source
   */
  lib.verifyConfigFactory({ env: 'BOT_OP_API_URL', attr: 'BOT_OP_API_URL' })

  lib.verifyConfigFactory({ env: 'BOT_TOTAL_PRICE_LIMIT', attr: 'totalPriceLimit' })
  // BOT_OP_PERCENTAGE
  lib.verifyConfigFactory({ env: 'BOT_OP_PERCENTAGE', attr: 'opPercentage' })
  logger.info(
    `Setting mode: ${config.mode}, asset: ${config.assetType}, product: ${
      config.productType
    }, profit limit: ${config.profitLimitPercentage}%`,
  )

  return 'SUCCESS'
}

/**
 * Bid mode methods required
 */

/**
 * Asset Balance
 * excluding on_order
 * @param {Object} payload
 * @param {string} payload.assetType
 * @param {boolean} payload.includeOrder
 * @returns {number}
 */
export const getAssetBalance = async ({
  assetType,
  includeOrder,
}: {
  assetType: string,
  includeOrder: boolean,
}) => {
  try {
    const res = await api.balances()
    if (!res.success || res.success !== true) throw new Error('Failed to retrieve balance')
    const data = res.result.balances.filter(b => b.currency === assetType)
    if (data.length !== 1) throw new Error(`Failed to retrieve balance, ${assetType}`)
    if (includeOrder === false) {
      return utils.minus(data[0].total, data[0].on_order)
    }
    return parseFloat(data[0].total)
  } catch (error) {
    throw new Error('Failed to retrieve balance')
  }
}

/**
 * isHighestBid Factory
 * @param {Object} payload
 * @param {Array} payload.bids
 * @param {number} payload.price
 */
export const isHighestBidOrder = ({
  bids,
  buyOrder,
}: {
  bids: Array<Order>,
  buyOrder: BuyOrder,
}) => {
  if (buyOrder === null) throw new Error('buyOrder is null')
  if (buyOrder.side !== 'bid') throw new Error('This order side is not bid, something wrong here')
  const left = bids.filter(item => parseFloat(item.price) >= parseFloat(buyOrder.price))
  if (left.length === 0)
    throw new Error('buy order list size is 0, unknown error plz contact bot author')
  const newLeft = left.sort(utils.sortOrder).reverse()
  const top = newLeft[0]
  const size = utils.minus(buyOrder.size, buyOrder.filled)
  if (
    parseFloat(top.price) === parseFloat(buyOrder.price) &&
    parseFloat(top.size) === parseFloat(size)
  )
    return true
  return false
}
/**
 * Check total price is larger than total price limit or not
 * @param {Object} payload
 */
export const checkOverLimit = ({ price, buyOrder, opPrice, totalPriceLimit }: { price: number, buyOrder: BuyOrder, opPrice: number, totalPriceLimit: number }) => {
  if (buyOrder===null) throw new Error("Buy Order is null")
  //(config.increment*2) fixed increment number issue
  if (parseFloat(price) > parseFloat(opPrice * (config.opPercentage / 100 + 1)))
    throw new Error('over op price but not detected, plz contact the bot author')
  const totalPrice = utils.multi(price, buyOrder.size)
  if (parseFloat(totalPrice) > parseFloat(totalPriceLimit))
    throw new Error('over total price limit but not detected, plz contact the bot author')
}

/**
 * check Enough Balance
 * @param {Object} payload
 */

export const checkEnoughBalance = async ({ price }: {price:number}) => {
  const { buyOrder } = store.getState()
  const left = await getAssetBalance({ assetType: config.assetType, includeOrder: false })
  const totalLeft = utils.plus(utils.multi(buyOrder.price, buyOrder.size), left)
  const totalOrder = utils.multi(price, buyOrder.size)

  if (totalOrder > totalLeft) throw new Error("You don't have enough $$ to modify this order")
}

/**
 * getBelowOpBuyOrderFy
 * @param {Object} payload
 * @param {Array} p.bids
 * @param {number} p.opPrice
 */
export const getBelowOpBuyOrder = ({ bids, opPrice }: {bids:Array<Order>, opPrice: number}) => {
  const newPrice =
    parseFloat(opPrice - (config.increment + 0.0000001)) * (config.opPercentage / 100 + 1)
  const newBids = bids.filter(b => parseFloat(b.price) < newPrice)
  return newBids.sort(utils.sortOrder).reverse()
}

/**
 * getBelowLimitBuyOrderFy
 * @param {Object} payload
 */
export const getBelowLimitBuyOrder = ({ bids, buyOrder, limit }:{ bids: Array<Order>, buyOrder: BuyOrder, limit:number }) => {
  if (buyOrder===null) throw new Error("Buy Order is null")
  const { size } = buyOrder
  const newBids = bids.filter(b => utils.multi(utils.plus(b.price, config.increment), size) < limit)
  return newBids.sort(utils.sortOrder).reverse()
}

/**
 * getBelowLimitBuyOrder
 * @param {Object} payload
 */

/**
 * isReducePriceFactory
 * @param {Object} payload
 */
export const isReducePrice = ({ bids, buyOrder, increment }:{ bids: Array<Order>, buyOrder: BuyOrder, increment:number }) => {
  if (buyOrder===null) throw new Error("Buy Order is null")
  const secBid = bids.sort(utils.sortOrder).reverse()[1]
  if (parseFloat(utils.plus(secBid.price, increment)) === parseFloat(buyOrder.price)) return false
  return true
}

export const getReducePriceFactory = ({ bids, increment }:{ bids: Array<Order>, increment:number }) => {
  const secBid = bids.sort(utils.sortOrder).reverse()[1]
  return parseFloat(utils.plus(secBid.price, increment))
}

/**
 *
 * @param {Object} payload
 */
export const getReducePrice = ({ bids }:{ bids: Array<Order>}) => {
  return getReducePriceFactory({ bids, increment: config.increment })
}

/**
 * getTopPrice
 * @param {Object} payload
 */
export const getTopPrice = ({ bids }:{ bids: Array<Order>}) => {
  return getTopPriceFactory({ bids, increment: config.increment })
}

/**
 * getTopPriceFactory
 * @param {Object} payload
 */
export const getTopPriceFactory = ({ bids, increment }:{ bids: Array<Order>, increment: number}) => {
  const newBids = bids.sort(utils.sortOrder).reverse()[0]
  return parseFloat(utils.plus(newBids.price, increment))
}

export const getExpectedCost = ({ sellPrice, profitPercentage }:{ sellPrice: number, profitPercentage: number }) => {
  // (x-y)/y*100 = z
  // y = 100x/(z+100) !=-100
  // return 100*sellPrice/(profitPercentage+100)
  const cost = utils.div(utils.multi(100, sellPrice), utils.plus(profitPercentage, 100))
  return cost
}

export const getLimitProfitBuyOrderFy = ({ asks, bids, profitPercentage }:{ asks: Array<Order>, bids:Array<Order>, profitPercentage:number }) => {
  const lowestAskPrice = lib.getLowestAskFy({ asks }).price
  const newBids = bids.filter(b => {
    return b.price < getExpectedCost({ sellPrice: lowestAskPrice, profitPercentage })
  })
  return newBids
}

export const getLimitProfitBuyOrder = ({ asks, bids }:{ asks: Array<Order>, bids:Array<Order>}) => {
  const profitPercentage = config.profitLimitPercentage
  return getLimitProfitBuyOrderFy({ asks, bids, profitPercentage })
}

export const inBidPriceBucket = ({ bids, buyOrder }:{ bids: Array<Order>, buyOrder: BuyOrder}) => {
  if (buyOrder===null) throw new Error ("Buy Order is null")
  const bidPrice = bids.map(a => parseFloat(a.price))
  if (bidPrice.includes(parseFloat(buyOrder.price))) return true
  return false
}

export const getValidQuantityCompareFy = ({ bids, buyOrder, quantityComparePercentage }:{ bids: Array<Order>, buyOrder: BuyOrder, quantityComparePercentage:number }) => {
  if (buyOrder===null) throw new Error ("Buy Order is null")
  const original = JSON.parse(JSON.stringify(bids))
  const temp = JSON.parse(JSON.stringify(bids))
  const bidsA = temp.sort(utils.sortOrder)

  const bidsB = bidsA.filter(b => b.price > buyOrder.price)
  let acc = 0
  const bidsC = bidsB.map(c => {
    acc += c.size
    // accumulation percentage
    const accp = utils.div(acc, buyOrder.size)
    return Object.assign(c, { accp })
  })
  const bidsD = bidsC.filter(d => d.accp < utils.div(quantityComparePercentage, 100))

  const newBids = bids.filter(nb => {
    const ans = bidsD.filter(e => e.price === nb.price)
    return ans.length === 0
  })
  return newBids
}

export const getValidQuantityCompare = ({ bids, buyOrder }: { bids: Array<Order>, buyOrder: BuyOrder }) => {
  const quantityComparePercentage = config.quantityComparePercentage
  return getValidQuantityCompareFy({ bids, buyOrder, quantityComparePercentage })
}
