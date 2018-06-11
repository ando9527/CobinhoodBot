import config from './config'
import utils from './utils'
import store from './reducer'
import lib from './lib'
import bidLib from './bidLib'
import logger from './utils/winston'
import { haltProcess } from './utils/utils';
import { opAgentRun } from './opWsClient';
import { getCCPrice } from './lib/lib';
import { onOpPriceUpdate } from './actions/opPrice';
import { wsModifyOrder, startSync, connected, orderBookNewest, setOrderBookNewest } from './actions/wob';

export const initial = async () => {
  await bidLib.verifyConfig()
}

export const bidStateMachine = () => {
  const { orderBook, buyOrder, opPrice } = store.getState()
  const { asks, bids } = orderBook
  const vQCBids = bidLib.getValidQuantityCompare({ bids, buyOrder })
  const lPBOBids = bidLib.getLimitProfitBuyOrder({ bids: vQCBids, asks })
  if (lPBOBids.length <= 1) return 'ZERO_LIMIT_PROFIT_BUY_ORDER'
  const oBids = bidLib.getBelowOpBuyOrder({ bids: lPBOBids, opPrice: opPrice.price })
  if (oBids.length <= 1) return 'ZERO_BELOW_OP_PRICE'
  const lBids = bidLib.getBelowLimitBuyOrder({
    bids: oBids,
    buyOrder,
    limit: config.totalPriceLimit,
  })
  if (lBids.length <= 1) return 'ZERO_BELOW_LIMIT_PRICE'
  const ib = bidLib.inBidPriceBucket({ bids: lBids, buyOrder })
  if (ib === false) return 'BE_TOP'
  const ih = bidLib.isHighestBidOrder({ bids: lBids, buyOrder })
  if (ih === false) return 'BE_TOP'
  const ir = bidLib.isReducePrice({ bids: lBids, buyOrder, increment: config.increment })
  if (ir === false) return 'NOTHING'
  if (ir === true) return 'REDUCE_PRICE'
}

export const check = async () => {
  // For Logic
  const code = bidStateMachine()
  const { opPrice, buyOrder, orderBook } = store.getState()
  const { asks, bids } = orderBook
  const vQCBids = bidLib.getValidQuantityCompare({ bids, buyOrder })
  const lPBOBids = bidLib.getLimitProfitBuyOrder({ bids: vQCBids, asks })
  const oBids = bidLib.getBelowOpBuyOrder({ bids: lPBOBids, opPrice: opPrice.price })
  const lBids = bidLib.getBelowLimitBuyOrder({
    bids: oBids,
    buyOrder,
    limit: config.totalPriceLimit,
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
  logger.info(
    `Yours: ${buyOrder.price}(${eppInfo}) Highest Bid: ${highestPrice}(${lib.getProfitPercentage({
      price: lowestAsk,
      productCost: highestPrice,
    })}%) Lowest Ask: ${lowestAsk} CoinGecko/last update: ${opPrice.price}(${lib.getProfitPercentage({
      price: opPrice.price,
      productCost: buyOrder.price,
    })}%)/${opPrice.lastUpdate}.`,
  )

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
      priceModified,
      buyOrder,
      opPrice: opPrice.price,
      totalPriceLimit: config.totalPriceLimit,
    })
    lib.checkProfitLimitPercentage({ profitPercentage: epp })
    logger.info("Your offer is good, you don't need to change.")
    return 'NOTHING'
  }

  let priceModified = 0
  let changeMessage = ''
  if (code === 'BE_TOP') {
    priceModified = bidLib.getTopPrice({ bids: lBids })
    changeMessage = 'Rasing Price'
  }
  if (code === 'REDUCE_PRICE') {
    priceModified = bidLib.getReducePrice({ bids: lBids })
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

  if (config.watchOnly === true) {
    logger.info(`You are in watch mode now, nothing to do here `)
    return 'WATCH_ONLY'
  }
  /**
   * will throw error if state machine logic is wrong
   */
  bidLib.checkOverLimit({
    price: priceModified,
    buyOrder,
    opPrice: opPrice.price,
    totalPriceLimit: config.totalPriceLimit,
  })
  lib.checkProfitLimitPercentage({ profitPercentage: mepp })
  await bidLib.checkEnoughBalance({ price: priceModified })
  await wsModifyOrder({ price: priceModified, order: buyOrder })
}

const runCheck = async () => {
  if (!connected) return
  if (orderBookNewest === false) return
  await check()
  setOrderBookNewest(false)
}

const runBuyOrder = async () => {
    try {
      // verify configuration
      await initial()
      // retrieve order/order book/opPrice once
      await lib.updateData()
      // sync order book data
      startSync()
      // sync Op Price
      opAgentRun()

    } catch (error) {
      const record = Object.assign({}, store.getState(), { config: null })
      logger.error(error)
      logger.error(`Original Data: ${JSON.stringify(record)}`)
      process.exit(1)
    }

    setInterval(async () => {
      if (!connected) return
      try {
        await runCheck()
      } catch (error) {
        await haltProcess(error)
      }
    }, 1000)
  
}

export const run = async () => {
  await runBuyOrder()
}



