// @flow
import utils from '../utils'
import store from '../store'
import Cobinhood from 'cobinhood-api-node'
import axios from 'axios'
import { onBuyOrderUpdate } from '../actions/buyOrder'
import { onSellOrderUpdate } from '../actions/sellOrder'
import type { Option } from '../types/option'
import { updateOrderBook, setOrderBook } from '../actions/orderBook'
import logger from '../helpers/winston'
import { onOpPriceUpdate } from '../actions/opPrice'
import type { BuyOrder } from '../types/buyOrder'
import type { SellOrder } from '../types/sellOrder'
import type { Order } from '../types/orderBook'
import _ from 'lodash'
import { isSubset } from '../utils/utils'
import assert from 'assert'
// export const api = Cobinhood({
//   apiSecret: option.apiSecret,
// })
/**
 * Crypto Compare Last trade
 * @param {Object} payload
 * @param {string} payload.from
 * @param {string} payload.to
 * @returns {number}
 */
export const getCCPrice = async ({
  from,
  to,
  option,
}: {
  from: string,
  to: string,
  option: Option,
}): Promise<number> => {
  try {
    const url = `${option.BOT_OP_API_URL}/${from.toLowerCase()}/${to.toLowerCase()}`
    const data = await axios.get(url)
    if (!data.data.data) throw new Error(`${from.toLowerCase()} is not available in ${url}`)
    return parseFloat(data.data.data)
  } catch (error) {
    throw new Error(`Get price from ${option.BOT_OP_API_URL} Failed, ${error}`)
  }
}

/**
 * Con Gecko price
 * Support ETH/BTC asset only
 * @param {Object} payload
 * @param {string} payload.from
 * @param {string} payload.to
 * @returns {number}
 */
export const getCGPrice = async ({ from, to }: { from: string, to: string }): Promise<number> => {
  const url = `https://crypto.nctu.me/api/cg/${from.toLowerCase()}/${to.toLowerCase()}`
  const data = await axios.get(url)
  return parseFloat(data.data.data)
}

/**
 * Modify Order
 * @param {Object} payload
 */

export const modifyOrder = async ({
  price,
  order,
  option,
}: {
  price: number,
  order: BuyOrder | SellOrder,
  option: Option,
}) => {
  if (!order) throw new Error('Current Order is null')
  const currentOrder = order
  try {
    const api = Cobinhood({
      apiSecret: option.apiSecret,
    })
    const { success } = await api.modifyOrder({
      order_id: currentOrder.id,
      trading_pair_id: currentOrder.trading_pair_id,
      price: price.toString(),
      size: currentOrder.size.toString(),
    }) /*eslint-disable camelcase*/ // eslint-disable-line
    if (success !== true)
      throw new Error(
        `Failed to modify order, price: ${JSON.stringify(price)}, current order: ${JSON.stringify(
          currentOrder,
        )}`,
      )
    const editMessage = `You have modified your order to the price ${price}`
    logger.info(editMessage)
  } catch (error) {
    throw new Error(
      `Failed to modify order, price: ${JSON.stringify(price)}, current order: ${JSON.stringify(
        currentOrder,
      )} ${error.message}`,
    )
  }
}

/**
 * Get information of current order
 * @return {Object} order
 */
export const getCurrentOrder = async (option: Option) => {
  try {
    let order_id = null
    if (option.mode === 'BID') {
      order_id = option.buyOrderId
    } else if (option.mode === 'ASK') {
      order_id = option.sellOrderId
    }
    const api = Cobinhood({
      apiSecret: option.apiSecret,
    })
    const data = await api.myOrderId({ order_id }) // eslint-disable camelcase

    if (!data)
      throw new Error('Can not retrieve your order from server, Error possibility not auth.')
    if (data.success === false)
      throw new Error(`Can not retrieve your order from server, Error ${data}`)
    const { order } = data.result
    if (order.state === 'filled') throw new Error('This order is not available right now.')
    logger.info(
      `Current Order Information, id: ${order.id}, symbol: ${order.trading_pair_id}, side: ${
        order.side
      }, price: ${order.price}, size: ${order.size}, option profit: ${
        option.profitLimitPercentage
      }%`,
    )
    return packageOrder({ order })
  } catch (error) {
    throw new Error(`Failed to get current order ${error}`)
  }
}

export const packageOrder = ({ order }: { order: Object }): BuyOrder | SellOrder => {
  const {
    id,
    trading_pair_id,
    side,
    type,
    price,
    size,
    filled,
    state,
    timestamp,
    eq_price,
    completed_at,
  } = order // eslint-disable-line camelcase
  return {
    id,
    trading_pair_id,
    side,
    type,
    price: parseFloat(price),
    size: parseFloat(size),
    filled: parseFloat(filled),
    state,
    timestamp: timestamp.toString(),
    eq_price: parseFloat(eq_price),
    completed_at,
  } // eslint-disable-line
}

export const checkProfitLimitPercentage = ({
  profitPercentage,
  profitLimitPercentage,
}: {
  profitPercentage: number,
  profitLimitPercentage: number,
}) => {
  // due to top price minus/plus 0.0000001
  if (utils.plus(profitPercentage, 1) < parseFloat(profitLimitPercentage)) {
    const message = JSON.stringify(store.getState())
    throw new Error(`'Under cost price but not detected, plz contact the bot author'.${message}`)
  }
}

export const getLowestAsk = () => {
  const { asks } = store.getState().orderBook
  return getLowestAskFy({ asks })
}

export const getLowestAskFy = ({ asks }: { asks: Array<Order> }) => {
  const ask = asks.sort(utils.sortOrder)[0]
  return ask
}

export const getHighestBid = () => {
  const { bids } = store.getState().orderBook
  return getHighestBidFy({ bids })
}

export const getHighestBidFy = ({ bids }: { bids: Array<Order> }) => {
  const bid = bids.sort(utils.sortOrder).reverse()[0]
  return bid
}

export const getProfitPercentage = ({
  price,
  productCost,
}: {
  price: number,
  productCost: number,
}) => {
  const spread = utils.minus(price, productCost)
  const fraction = utils.div(spread, productCost)
  const profit = parseFloat(utils.multi(fraction, 100).toFixed(2))
  return profit
}

/**
 * @param {Object} payload
 * @param {string} payload.env
 * @param {string} payload.attr
 * @param {Array} payload.requires
 */
export const verifyConfigFactory = ({
  env,
  attr,
  requires = [],
  option,
}: {
  env: string,
  attr: string,
  requires?: Array<string>,
  option: Option,
}) => {
  if (!env) throw new Error('You need to pass a env string.')
  if (!attr) throw new Error('You need to pass a option attribute.')
  if (!process.env.hasOwnProperty(env)) throw new Error(`Please setup ${env}`)
  if (!option.hasOwnProperty(attr))
    throw new Error(
      `Config attribute issue, contact bot author plz ${attr} ${JSON.stringify(option)}`,
    )

  if (requires.length === 0) return true
  if (!requires.includes(process.env[env]))
    throw new Error(`${env} ENV, please use ${requires.toString()}`)
}

export const commonVerifyConfig = async (option: Option) => {
  logger.info('Verifying your option..')
  /**
   * Check API Secret
   * BOT_API_SECRET
   */
  verifyConfigFactory({ env: 'BOT_API_SECRET', attr: 'apiSecret', option })
  try {
    const api = Cobinhood({
      apiSecret: option.apiSecret,
    })
    await api.balances()
  } catch (error) {
    throw new Error(`API Secret is no valid. ${error.message}`)
  }
  /**
   * Check Ifttt
   * BOT_IFTTT_ENABLE
   */
  verifyConfigFactory({
    env: 'BOT_IFTTT_ENABLE',
    attr: 'iftttEnable',
    requires: ['true', 'false'],
    option,
  })
  if (option.iftttEnable === true) {
    verifyConfigFactory({ env: 'BOT_IFTTT_EVENT', attr: 'iftttEvent', option })
    verifyConfigFactory({ env: 'BOT_IFTTT_KEY', attr: 'iftttKey', option })
  }

  if (option.iftttEnable === true) {
    verifyConfigFactory({ env: 'BOT_IFTTT_EVENT', attr: 'iftttEvent', option })
    verifyConfigFactory({ env: 'BOT_IFTTT_KEY', attr: 'iftttKey', option })
  }

  /**
   * check smallest increment
   */
  verifyConfigFactory({ env: 'BOT_SMALLEST_INCREMENT', attr: 'increment', option })
  verifyConfigFactory({ env: 'BOT_SMALLEST_INCREMENT', attr: 'decrement', option })

  /**
   * Check ENV  BID & ASK both required
   */
  // BOT_WATCH_ONLY
  verifyConfigFactory({
    env: 'BOT_WATCH_ONLY',
    attr: 'watchOnly',
    requires: ['true', 'false'],
    option,
  })
  // BOT_MODE
  verifyConfigFactory({
    env: 'BOT_MODE',
    attr: 'mode',
    requires: ['bid', 'ask', 'BID', 'ASK'],
    option,
  })
  if (!option.mode) throw new Error('Please setup BOT_MODE')
  // BOT_ASSET_TYPE
  verifyConfigFactory({
    env: 'BOT_ASSET_TYPE',
    attr: 'assetType',
    requires: ['ETH', 'USDT', 'BTC', 'eth', 'usdt', 'btc'],
    option,
  })
  // BOT_PRODUCT_TYPE
  verifyConfigFactory({ env: 'BOT_PRODUCT_TYPE', attr: 'productType', option })
  const api = Cobinhood({
    apiSecret: option.apiSecret,
  })
  const data = await api.allCurrencies()
  const ans = data.result.currencies.filter(coin => coin.currency === option.productType)
  if (!ans === 1) throw new Error('Please setup supportive BOT_PRODUCT_TYPE')
  verifyConfigFactory({ env: 'BOT_PROFIT_LIMIT_PERCENTAGE', attr: 'profitLimitPercentage', option })
  verifyConfigFactory({
    env: 'BOT_QUANTITY_COMPARE_PERCENTAGE',
    attr: 'quantityComparePercentage',
    option,
  })
  if (parseFloat(option.profitLimitPercentage) > 100000)
    throw new Error('Profit limit Percentage over 100000, something must wrong here')
  if (parseFloat(option.profitLimitPercentage) < 0)
    throw new Error('Profit limit Percentage is negative, something must wrong here')
}

export const isOrderMatch = (order: BuyOrder | SellOrder, option: Option) => {
  if (!order) throw new Error('Can not get current order')
  // const {trading_pair_id, side  } = order

  if (option.mode.toUpperCase() === 'ASK') {
    try {
      assert.deepEqual(order.id, option.sellOrderId)
      assert.deepEqual(order.trading_pair_id.toUpperCase(), option.symbol.toUpperCase())
      assert.deepEqual(order.side.toUpperCase(), option.mode.toUpperCase())
    } catch (e) {
      return false
    }
    return true
  }
  if (option.mode.toUpperCase() === 'BID') {
    try {
      assert.deepEqual(order.id, option.buyOrderId)
      assert.deepEqual(order.trading_pair_id.toUpperCase(), option.symbol.toUpperCase())
      assert.deepEqual(order.side.toUpperCase(), option.mode.toUpperCase())
    } catch (e) {
      return false
    }
    return true
  }

  return false
}

/**
 * Update order/order book/balance/opPrice data
 */
export const updateData = async (option: Option) => {
  if (option.mode === 'BID') {
    const buyOrder: BuyOrder = await getCurrentOrder(option)
    if (isOrderMatch(buyOrder, option) === false)
      throw new Error(`Current order and option not match, buyOrder: ${JSON.stringify(buyOrder)}`)
    store.dispatch(onBuyOrderUpdate({ payload: buyOrder }))
    const opPrice = await getCCPrice({ from: option.productType, to: option.assetType, option })
    store.dispatch(onOpPriceUpdate({ payload: { price: opPrice } }))
  } else if (option.mode === 'ASK') {
    const sellOrder: SellOrder = await getCurrentOrder(option)
    store.dispatch(onSellOrderUpdate({ payload: sellOrder }))
    if (isOrderMatch(sellOrder, option) === false)
      throw new Error(`Current order and option not match, sellOrder: ${JSON.stringify(sellOrder)}`)
  }

  const api = Cobinhood({
    apiSecret: option.apiSecret,
  })
  const orderBook = await api.orderBooks({ trading_pair_id: option.symbol }) // eslint-disable-line
  const newOrderBook = packageOrderBook({ orderBook })
  store.dispatch(setOrderBook({ payload: newOrderBook }))
}

export const packageOrderBook = ({ orderBook }: { orderBook: Object }) => {
  const asks = orderBook.asks.map(a => {
    return { price: parseFloat(a.price), count: parseFloat(a.count), size: parseFloat(a.size) }
  })
  const bids = orderBook.bids.map(b => {
    return { price: parseFloat(b.price), count: parseFloat(b.count), size: parseFloat(b.size) }
  })
  return { asks, bids }
}
