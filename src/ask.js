import config from 'config'
import colors from 'colors/safe'
import utils from './utils'
import store from './reducer'
import lib from './lib'
import askLib from './askLib'
import { startSync } from './actions/wob';

export const initial = async () => {
  await askLib.verifyConfig()
}

export const askStateMachine = () => {
  const { orderBook, sellOrder } = store.getState()
  const { asks } = orderBook
  const vQCAsks = askLib.getValidQuantityCompare({ asks, sellOrder })
  const lPSOAsks = askLib.getLimitProfitSellOrder({ asks: vQCAsks })
  if (lPSOAsks.length <= 1) return 'ZERO_LIMIT_PROFIT_SELL_ORDER'
  const casks = askLib.getAboveCostSellOrder({ asks: lPSOAsks })

  if (casks.length <= 1) return 'ZERO_ABOVE_COST_PRICE'
  const ia = askLib.inAskPriceBucket({ asks: casks, sellOrder })
  if (ia === false) return 'BE_LAST'
  const il = askLib.isLowestAskOrder({ asks: casks })
  if (il === false) return 'BE_LAST'
  const ig = askLib.isGainPrice({ asks: casks })
  if (ig === false) return 'NOTHING'
  if (ig === true) return 'GAIN_PRICE'
}

export const check = async () => {
  // For Logic

  const code = askStateMachine()

  const { sellOrder, orderBook } = store.getState()
  const { asks } = orderBook
  const vQCAsks = askLib.getValidQuantityCompare({ asks, sellOrder })
  const lPSOAsks = askLib.getLimitProfitSellOrder({ asks: vQCAsks })
  const casks = askLib.getAboveCostSellOrder({ asks: lPSOAsks })

  // Expected Profit Percentage
  const epp = lib.getProfitPercentage({ price: sellOrder.price, productCost: config.productCost })
  const eppInfo = `${epp}%`

  // For Info Display only
  const lowestPrice = lib.getLowestAsk().price
  utils.green(
    `Yours: ${sellOrder.price}(${eppInfo}) Lowest: ${lowestPrice}(${lib.getProfitPercentage({
      price: lowestPrice,
      productCost: config.productCost,
    })}%).`,
  )

  if (code === 'ZERO_LIMIT_PROFIT_SELL_ORDER')
    throw new Error('Price of sell orders on the list break your profit limit.')
  if (code === 'ZERO_ABOVE_COST_PRICE')
    throw new Error('Price of sell orders on the list all above your cost')

  if (code === 'NOTHING') {
    // will throw error if state machine logic is wrong
    askLib.checkUnderCost({ price: sellOrder.price })
    lib.checkProfitLimitPercentage({ profitPercentage: epp })
    utils.myLog("Your price is good, you don't need to change")
    return 'NOTHING'
  }
  let priceModified = 0
  let changeMessage = ''
  if (code === 'BE_LAST') {
    priceModified = askLib.getLastPrice({ asks: casks })
    changeMessage = `Reducing price.`
  }
  if (code === 'GAIN_PRICE') {
    priceModified = askLib.getGainedPrice({ asks: casks })
    changeMessage = `Raising price.`
  }

  if (priceModified === sellOrder.price) {
    console.log('PRICE the same, do nothing here, temporary bug... will fix soon')
    return 'NOTHING_BUG'
  }
  // Modified Expected Profit Percentage
  const mepp = lib.getProfitPercentage({ price: priceModified, productCost: config.productCost })
  utils.yellow(`${priceModified}(${mepp}%) ${changeMessage}`)

  if (config.watchOnly) {
    utils.myLog(colors.green(`You are in watch mode now, nothing to do here `))
    return 'WATCH_ONLY'
  }

  // will throw error if state machine logic is wrong
  askLib.checkUnderCost({ price: priceModified })
  lib.checkProfitLimitPercentage({ profitPercentage: mepp })
  await lib.modifyOrder({ price: priceModified, order: sellOrder })
}

const runSellOrder = async () => {
  return new Promise(async(res,rej)=>{
    try {
      await initial()
      await lib.updateData()
      await check()
      await startSync()
  
      
    } catch (error) {
      const record = utils.removeProperty(store.getState(), 'config')
      console.log('real time data==================================')
      console.log(JSON.stringify(record))
      console.log(`end real time data===============================`)
      rej(error)
    }
  
    const id = setInterval(async () => {
      try {
        utils.myLog('')
        await check()
        
        
      } catch (error) {
        clearInterval(id)
        console.log(error.message)
  
        const record = utils.removeProperty(store.getState(), 'config')
        await utils.sendIfttt(
          `${config.mode} - ${config.symbol} - ${error.message}`,
          JSON.stringify(record),
        )
  
        rej(error)
      }
    }, config.intervalSecond * 100)
  })

}

export const run = async () => {
  await runSellOrder()

}
