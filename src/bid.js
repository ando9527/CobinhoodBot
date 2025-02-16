// @flow
import utils from './utils'
import store from './store'
import lib from './lib'
import bidLib from './bidLib'
import logger from './helpers/logger'
import { opAgentRun } from './opWsClient'
import { getCCPrice, modifyOrder } from './lib/lib'
import { onOpPriceUpdate } from './actions/opPrice'
import colors from 'colors/safe'
import type { Option } from './types/option'
import {
  startSync,
  wsModifyOrder,
  connected,
  orderBookNewest,
  setOrderBookNewest,
} from './cobWsClient'

export const initial = async (option: Option) => {
  await bidLib.verifyConfig(option)
}

export const bidStateMachine = (option: Option) => {
  const { orderBook, buyOrder, opPrice } = store.getState()
  const { asks, bids } = orderBook
  const vQCBids = bidLib.getValidQuantityCompare({
    bids,
    buyOrder,
    quantityComparePercentage: option.quantityComparePercentage,
  })
  const lPBOBids = bidLib.getLimitProfitBuyOrder({
    bids: vQCBids,
    asks,
    profitLimitPercentage: option.profitLimitPercentage,
  })
  if (lPBOBids.length <= 1) return 'ZERO_LIMIT_PROFIT_BUY_ORDER'
  const oBids = bidLib.getBelowOpBuyOrder({
    bids: lPBOBids,
    opPrice: opPrice.price,
    increment: option.increment,
    opPercentage: option.opPercentage,
  })
  if (oBids.length <= 1) return 'ZERO_BELOW_OP_PRICE'
  const lBids = bidLib.getBelowLimitBuyOrder({
    bids: oBids,
    buyOrder,
    limit: option.totalPriceLimit,
    increment: option.increment,
  })
  if (lBids.length <= 1) return 'ZERO_BELOW_LIMIT_PRICE'
  const ib = bidLib.inBidPriceBucket({ bids: lBids, buyOrder })
  if (ib === false) return 'BE_TOP'
  const ih = bidLib.isHighestBidOrder({ bids: lBids, buyOrder })
  if (ih === false) return 'BE_TOP'
  const ir = bidLib.isReducePrice({ bids: lBids, buyOrder, increment: option.increment })
  if (ir === false) return 'NOTHING'
  if (ir === true) return 'REDUCE_PRICE'
}

export const check = async ({ option, wsModify }: { option: Option, wsModify: boolean }) => {
  // For Logic
  const code = bidStateMachine(option)
  const { opPrice, buyOrder, orderBook } = store.getState()
  const { asks, bids } = orderBook
  const vQCBids = bidLib.getValidQuantityCompare({
    bids,
    buyOrder,
    quantityComparePercentage: option.quantityComparePercentage,
  })
  const lPBOBids = bidLib.getLimitProfitBuyOrder({
    bids: vQCBids,
    asks,
    profitLimitPercentage: option.profitLimitPercentage,
  })
  const oBids = bidLib.getBelowOpBuyOrder({
    bids: lPBOBids,
    opPrice: opPrice.price,
    increment: option.increment,
    opPercentage: option.opPercentage,
  })
  const lBids = bidLib.getBelowLimitBuyOrder({
    bids: oBids,
    buyOrder,
    limit: option.totalPriceLimit,
    increment: option.increment,
  })
  // Expected Profit Percentage
  const epp = lib.getProfitPercentage({
    price: lib.getLowestAsk().price,
    productCost: buyOrder.price,
  })
  const eppInfo = `${epp}%`
  const lowestAsk = lib.getLowestAsk().price
  // For Info
  const highestPrice = lib.getHighestBid().price

  const yoursInfo = colors.blue(`Yours: ${buyOrder.price}(${eppInfo}),`)
  const highestBidInfo = colors.yellow(
    `Highest Bid: ${highestPrice}(${lib.getProfitPercentage({
      price: lowestAsk,
      productCost: highestPrice,
    })}%),`,
  )
  const lowestAskInfo = colors.green(`Lowest Ask: ${lowestAsk},`)
  const opPriceInfo = colors.grey(
    `CoinGecko/LastUpdate: ${opPrice.price}(${lib.getProfitPercentage({
      price: opPrice.price,
      productCost: buyOrder.price,
    })}%)/${opPrice.lastUpdate}.`,
  )

  logger.info(`${yoursInfo}, ${highestBidInfo}, ${lowestAskInfo}, ${opPriceInfo}`)

  if (code === 'ZERO_LIMIT_PROFIT_SELL_ORDER')
    throw new Error('Price of buy orders on the list break your profit limit.')
  if (code === 'ZERO_BELOW_OP_PRICE')
    throw new Error(
      'Price of orders on list with your order size is higher than external exchange  price',
    )
  if (code === 'ZERO_BELOW_LIMIT_PRICE')
    throw new Error(
      'Prices of orders on list with your order size is higher than limit price which you set',
    )

  if (code === 'NOTHING') {
    // will throw error if state machine logic is wrong
    bidLib.checkOverLimit({
      price: buyOrder.price,
      buyOrder,
      opPrice: opPrice.price,
      totalPriceLimit: option.totalPriceLimit,
      opPercentage: option.opPercentage,
    })
    lib.checkProfitLimitPercentage({
      profitPercentage: epp,
      profitLimitPercentage: option.profitLimitPercentage,
    })
    logger.info('Your offer is good, you don\'t need to change.')
    return 'NOTHING'
  }

  let priceModified = 0
  let changeMessage = ''
  if (code === 'BE_TOP') {
    priceModified = bidLib.getTopPrice({ bids: lBids, increment: option.increment })
    changeMessage = 'Rasing Price'
  }
  if (code === 'REDUCE_PRICE') {
    priceModified = bidLib.getReducePrice({ bids: lBids, increment: option.increment })
    changeMessage = 'Reducing Price'
  }

  if (priceModified === buyOrder.price) {
    logger.warn('PRICE the same, do nothing here, temporary bug... will fix soon')
    return 'NOTHING_BUG'
  }
  // Modified Expected Profit Percentage
  const mepp = lib.getProfitPercentage({
    price: lib.getLowestAsk().price,
    productCost: priceModified,
  })
  logger.info(`${priceModified}(${mepp}%) ${changeMessage}`)

  if (option.watchOnly === true) {
    logger.info('You are in watch mode now, nothing to do here ')
    return 'WATCH_ONLY'
  }
  /**
   * will throw error if state machine logic is wrong
   */
  bidLib.checkOverLimit({
    price: priceModified,
    buyOrder,
    opPrice: opPrice.price,
    totalPriceLimit: option.totalPriceLimit,
    opPercentage: option.opPercentage,
  })
  lib.checkProfitLimitPercentage({
    profitPercentage: mepp,
    profitLimitPercentage: option.profitLimitPercentage,
  })
  // await bidLib.checkEnoughBalance({ price: priceModified })

  if (wsModify === true) return await wsModifyOrder({ price: priceModified, order: buyOrder })
  if (wsModify === false)
    return await modifyOrder({ price: priceModified, order: buyOrder, option })
}

const runCheck = async (option: Option) => {
  if (!connected) return
  if (orderBookNewest === false) return
  await check({ option, wsModify: true })
  setOrderBookNewest(false)
}

export const runBuyOrder = async (option: Option) => {
  // verify configuration
  await initial(option)
  // retrieve order/order book/opPrice once
  await lib.updateData(option)
  await check({ option, wsModify: false })
  // sync order book data
  startSync(option)
  // sync Op Price
  opAgentRun(option)

  setInterval(async () => {
    if (!connected) return
    try {
      await runCheck(option)
    } catch (error) {
      logger.error(error, option)
    }
  }, option.BOT_CHECK_INTERVAL * 1000)
}
