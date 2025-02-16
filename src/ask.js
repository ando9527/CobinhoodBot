// @flow
import colors from 'colors/safe'
import utils from './utils'
import store from './store'
import lib from './lib'
import askLib from './askLib'
import logger from './helpers/logger'
import type { Option } from './types/option'
import {
  startSync,
  wsModifyOrder,
  connected,
  orderBookNewest,
  setOrderBookNewest,
} from './cobWsClient'
import { modifyOrder } from './lib/lib'

export const initial = async (option: Option) => {
  await askLib.verifyConfig(option)
}
export const askStateMachine = (option: Option) => {
  const { orderBook, sellOrder } = store.getState()
  const { asks } = orderBook
  const vQCAsks = askLib.getValidQuantityCompare({
    asks,
    sellOrder,
    quantityComparePercentage: option.quantityComparePercentage,
  })
  const lPSOAsks = askLib.getLimitProfitSellOrder({
    asks: vQCAsks,
    productCost: option.productCost,
    profitLimitPercentage: option.profitLimitPercentage,
  })
  if (lPSOAsks.length <= 1) return 'ZERO_LIMIT_PROFIT_SELL_ORDER'
  const casks = askLib.getAboveCostSellOrder({ asks: lPSOAsks, productCost: option.productCost })

  if (casks.length <= 1) return 'ZERO_ABOVE_COST_PRICE'
  const ia = askLib.inAskPriceBucket({ asks: casks, sellOrder })
  if (ia === false) return 'BE_LAST'
  const il = askLib.isLowestAskOrder({ asks: casks })
  if (il === false) return 'BE_LAST'
  const ig = askLib.isGainPrice({ asks: casks, decrement: option.decrement })
  if (ig === false) return 'NOTHING'
  if (ig === true) return 'GAIN_PRICE'
}

export const check = async ({ option, wsModify }: { option: Option, wsModify: boolean }) => {
  // For Logic
  const code = askStateMachine(option)

  const { sellOrder, orderBook } = store.getState()
  const { asks } = orderBook
  const vQCAsks = askLib.getValidQuantityCompare({
    asks,
    sellOrder,
    quantityComparePercentage: option.quantityComparePercentage,
  })
  const lPSOAsks = askLib.getLimitProfitSellOrder({
    asks: vQCAsks,
    productCost: option.productCost,
    profitLimitPercentage: option.profitLimitPercentage,
  })
  const casks = askLib.getAboveCostSellOrder({ asks: lPSOAsks, productCost: option.productCost })

  // Expected Profit Percentage
  const epp = lib.getProfitPercentage({ price: sellOrder.price, productCost: option.productCost })
  const eppInfo = `${epp}%`

  // For Info Display only
  const lowestPrice = lib.getLowestAsk().price
  logger.info(
    `Yours: ${sellOrder.price}(${eppInfo}) Lowest: ${lowestPrice}(${lib.getProfitPercentage({
      price: lowestPrice,
      productCost: option.productCost,
    })}%).`,
  )

  if (code === 'ZERO_LIMIT_PROFIT_SELL_ORDER')
    throw new Error('Price of sell orders on the list break your profit limit.')
  if (code === 'ZERO_ABOVE_COST_PRICE')
    throw new Error('Price of sell orders on the list all above your cost')

  if (code === 'NOTHING') {
    // will throw error if state machine logic is wrong
    askLib.checkUnderCost({ price: sellOrder.price, productCost: option.productCost })
    lib.checkProfitLimitPercentage({
      profitPercentage: epp,
      profitLimitPercentage: option.profitLimitPercentage,
    })
    logger.info('Your price is good, you don\'t need to change')

    return 'NOTHING'
  }
  let priceModified = 0
  let changeMessage = ''
  if (code === 'BE_LAST') {
    priceModified = askLib.getLastPrice({ asks: casks, decrement: option.decrement })
    changeMessage = 'Reducing price.'
  }
  if (code === 'GAIN_PRICE') {
    priceModified = askLib.getGainedPrice({ asks: casks, decrement: option.decrement })
    changeMessage = 'Raising price.'
  }

  if (priceModified === sellOrder.price) {
    logger.warn('PRICE the same, do nothing here, temporary bug... will fix soon')
    return 'NOTHING_BUG'
  }
  // Modified Expected Profit Percentage
  const mepp = lib.getProfitPercentage({ price: priceModified, productCost: option.productCost })
  logger.info(`${priceModified}(${mepp}%) ${changeMessage}`)

  if (option.watchOnly) {
    logger.info('You are in watch mode now, nothing to do here ')
    return 'WATCH_ONLY'
  }

  // will throw error if state machine logic is wrong
  askLib.checkUnderCost({ price: priceModified, productCost: option.productCost })
  lib.checkProfitLimitPercentage({
    profitPercentage: mepp,
    profitLimitPercentage: option.profitLimitPercentage,
  })
  //
  if (wsModify === true) return await wsModifyOrder({ price: priceModified, order: sellOrder })
  if (wsModify === false)
    return await modifyOrder({ price: priceModified, order: sellOrder, option })
}

const runCheck = async (option: Option) => {
  if (!connected) return

  if (orderBookNewest === false) return

  await check({ option, wsModify: true })
  setOrderBookNewest(false)
}

export const runSellOrder = async (option: Option) => {
  await initial(option)
  await lib.updateData(option)
  await check({ option, wsModify: false })
  await startSync(option)

  const id = setInterval(async () => {
    if (!connected) return
    try {
      await runCheck(option)
    } catch (error) {
      logger.error(error, option)
      clearInterval(id)
    }
  }, option.BOT_CHECK_INTERVAL * 1000)
}
