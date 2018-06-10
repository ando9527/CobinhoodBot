import Cobinhood from 'cobinhood-api-node'
import config from '../config'
import colors from 'colors/safe'
import utils from '../utils'
import store from '../reducer'
import lib from '../lib'
import logger from '../utils/winston';

export const api = Cobinhood({
  apiSecret: config.apiSecret,
})

export const verifyConfig=async()=>{
    await lib.commonVerifyConfig()

    // BOT_SELL_ORDER_ID
    lib.verifyConfigFactory({env: "BOT_SELL_ORDER_ID", attr: "sellOrderId"})
    /**
     * Check ENV ASK required
     */
    if(!config.productCost) throw new Error("Please setup BOT_PRODUCT_COST")

    /**
     * Verify Done
     */
    logger.info(`Configuration is good, the bot is ready to go!`)
    logger.info(`Mode: ${config.mode}`)
    logger.info(`Asset: ${config.assetType}`)
    logger.info(`Product: ${config.productType}`)
    logger.info(`Profit Limit: ${config.profitLimitPercentage}%`)
    return "SUCCESS"
    
}

/**
 * @param {Object} payload
 */
export const getAboveCostSellOrder=({asks})=>{
    return getAboveCostSellOrderFy({asks, productCost: config.productCost})
}

export const getAboveCostSellOrderFy=({asks, productCost})=>{
    const newAsks = asks.filter(a=>parseFloat(a.price)>parseFloat(productCost))
    return newAsks.sort(utils.sortOrder)
}
/**
 * isHighestAskOrder
 */
export const isLowestAskOrder=({asks})=>{
    const {sellOrder} = store.getState()
    if (sellOrder.side!=="ask") throw new Error("This order side is not ask, something wrong here")
    return isLowestAskOrderFactory({asks, sellOrder}) 
} 

export const isLowestAskOrderFactory=({asks, sellOrder})=>{
    const left = asks.filter(item=> parseFloat(item.price) <= parseFloat(sellOrder.price))
    if (left.length===0) throw new Error('sell order list size is 0, unknown error plz contact bot author')
    const newLeft = left.sort(utils.sortOrder)
    const smallest = newLeft[0]
    const size = utils.minus(sellOrder.size, sellOrder.filled)
    if (parseFloat(smallest.price) === parseFloat(sellOrder.price) && parseFloat(smallest.size) === parseFloat(size)) return true
    return false
}

/**
 * @param {Object} payload
 */
export const isGainPrice=({asks})=>{
    const {sellOrder} = store.getState()
    return isGainPriceFactory({asks, sellOrder, decrement: config.decrement})
}

export const isGainPriceFactory=({asks, sellOrder, decrement})=>{
    const secAsk = asks.sort(utils.sortOrder)[1]
    if (utils.minus(secAsk.price,decrement)=== parseFloat(sellOrder.price))return false
    return true
}

export const getLastPrice=({asks})=>{
    return getLastPriceFactory({asks, decrement: config.decrement})
}

export const getLastPriceFactory=({asks, decrement})=>{
    const newAsks = asks.sort(utils.sortOrder)[0]
    return utils.minus(newAsks.price, decrement)
}
/**
 * Check price is under cost or not
 */
export const checkUnderCost=({price})=>{
    if (parseFloat(price) < parseFloat(config.productCost)) throw new Error('Under cost price but not detected, plz contact the bot author')
}

/**
 * get Gained price
 *  
 */
export const getGainedPrice=({asks})=>{
    return getGainedPriceFactory({asks, decrement: config.decrement})
}

export const getGainedPriceFactory=({asks,  decrement})=>{ 
    const secAsk = asks.sort(utils.sortOrder)[1]
    return utils.minus(secAsk.price, decrement)

}

    
export const getLimitProfitSellOrderFy = ({asks,productCost, profitLimitPercentage }) => {
    const newAsks = asks.filter(a=>{
        return lib.getProfitPercentage({price: a.price, productCost}) > profitLimitPercentage
    })
    return newAsks
}

export const getLimitProfitSellOrder = ({asks}) => {
    return getLimitProfitSellOrderFy({asks, productCost: parseFloat(config.productCost), profitLimitPercentage: parseFloat(config.profitLimitPercentage)})
}

export const inAskPriceBucket =({asks, sellOrder})=>{
    const askPrice = asks.map(a=>parseFloat(a.price))
    if (askPrice.includes(parseFloat(sellOrder.price)))return true
    return false
}

export const getValidQuantityCompareFy = ({asks, sellOrder, quantityComparePercentage})=>{
    const temp = JSON.parse(JSON.stringify(asks))
    const asksA = temp.sort(utils.sortOrder).reverse()
    const asksB = asksA.filter(a=>a.price<sellOrder.price)
    
    let acc = 0
    const asksC = asksB.map(c=>{
        acc+=c.size
        // accumulation percentage
        const accp = parseFloat(utils.div(acc,sellOrder.size))
        return Object.assign(c, {accp})
    })
    const asksD = asksC.filter(d=>d.accp<utils.div(quantityComparePercentage,100))
    const newAsks = asks.filter(na=>{
        const ans = asksD.filter(e=>e.price===na.price)
        return (ans.length===0)
    })
    return newAsks
}

export const getValidQuantityCompare = ({asks, sellOrder}) => {
    const quantityComparePercentage = config.quantityComparePercentage
    return getValidQuantityCompareFy({asks, sellOrder, quantityComparePercentage})
}
