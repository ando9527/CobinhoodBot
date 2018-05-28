import Cobinhood from 'cobinhood-api-node'
import config from '../config'
import colors from 'colors/safe'
import utils from '../utils'
import store from '../reducer'
import lib from '../lib'
export const api = Cobinhood({
  apiSecret: config.apiSecret,
})

/**
 * Check ENV BID required
 */
export const verifyConfig=async()=>{  
    await lib.commonVerifyConfig()
    // BOT_BUY_ORDER_ID
    lib.verifyConfigFactory({env: "BOT_BUY_ORDER_ID", attr: "buyOrderId"})
    // BOT_TOTAL_PRICE_LIMIT

    /**
     * check api source
     */
    lib.verifyConfigFactory({env: "BOT_API_URL", attr:"BOT_API_URL"})

    lib.verifyConfigFactory({env: "BOT_TOTAL_PRICE_LIMIT", attr: "totalPriceLimit"})
    // BOT_OP_PERCENTAGE
    lib.verifyConfigFactory({env: "BOT_OP_PERCENTAGE", attr: "opPercentage"})
    utils.myLog(colors.magenta(`Configuration is good, the bot is ready to go!`))
    utils.myLog(colors.magenta(`Mode: ${config.mode}`));
    utils.myLog(colors.magenta(`Asset: ${config.assetType}`));
    utils.myLog(colors.magenta(`Product: ${config.productType}`));
    utils.myLog(colors.magenta(`Profit Limit: ${config.profitLimitPercentage}%`));
    
    return "SUCCESS"
    
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
export const getAssetBalance = async({assetType, includeOrder})=>{
    try {
        const res = await api.balances()
        if (!res.success || res.success!==true) throw new Error('Failed to retrieve balance')
        const data = res.result.balances.filter(b=> b.currency===assetType)
        if (data.length!==1) throw new Error(`Failed to retrieve balance, ${ assetType}`)
        if (includeOrder === false){
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
export const isHighestBidOrder=({bids, buyOrder})=>{
    if (buyOrder.side!=='bid') throw new Error('This order side is not bid, something wrong here')
    const left = bids.filter(item=>parseFloat(item.price)>=parseFloat(buyOrder.price))
    if (left.length===0) throw new Error('buy order list size is 0, unknown error plz contact bot author')
    const newLeft = left.sort(utils.sortOrder).reverse()
    const top = newLeft[0]
    const size = utils.minus(buyOrder.size, buyOrder.filled)
    if (parseFloat(top.price) === parseFloat(buyOrder.price) && parseFloat(top.size) === parseFloat(size)) return true
    return false
  
}
/**
 * Check total price is larger than total price limit or not
 * @param {Object} payload
 */
export const checkOverLimit=({price, buyOrder, opPrice, totalPriceLimit})=>{
    //(config.increment*2) fixed increment number issue
    if (parseFloat(price)> parseFloat(opPrice*((config.opPercentage/100)+1))) throw new Error('over op price but not detected, plz contact the bot author')
    const totalPrice = utils.multi(price, buyOrder.size)
    if (parseFloat(totalPrice)> parseFloat(totalPriceLimit)) throw new Error("over total price limit but not detected, plz contact the bot author")
}

/**
 * check Enough Balance
 * @param {Object} payload
 */ 
export const checkEnoughBalance = async ({price})=>{
    const {buyOrder} = store.getState()
    const left = await getAssetBalance({assetType: config.assetType, includeOrder: false})
    const totalLeft = utils.plus(utils.multi(buyOrder.price, buyOrder.size), left) 
    const totalOrder = utils.multi(price, buyOrder.size)

    if (totalOrder> totalLeft) throw new Error("You don't have enough $$ to modify this order")
}







/**
 * getBelowOpBuyOrderFy
 * @param {Object} payload
 * @param {Array} p.bids
 * @param {number} p.opPrice 
 */
export const getBelowOpBuyOrder=({bids, opPrice})=>{
    const newPrice = parseFloat(opPrice-(config.increment+0.0000001)) * ((config.opPercentage/100)+1)
    const newBids = bids.filter(b=>parseFloat(b.price)<newPrice)
    return newBids.sort(utils.sortOrder).reverse()
}

/**
 * getBelowLimitBuyOrderFy
 * @param {Object} payload
 */
export const getBelowLimitBuyOrder=({bids, buyOrder, limit})=>{
    const {size} = buyOrder
    const newBids = bids.filter(b=>utils.multi(utils.plus(b.price, config.increment), size)< limit)
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
export const isReducePrice=({bids, buyOrder, increment})=>{
    
    const secBid = bids.sort(utils.sortOrder).reverse()[1]
    if(parseFloat(utils.plus(secBid.price, increment))=== parseFloat(buyOrder.price)) return false
    return true
}


export const getReducePriceFactory=({bids, increment})=>{
    const secBid = bids.sort(utils.sortOrder).reverse()[1]
    return parseFloat(utils.plus(secBid.price, increment))
}

/**
 * 
 * @param {Object} payload
 */
export const getReducePrice=({bids})=>{
    return getReducePriceFactory({bids,  increment: config.increment})
}

/**
 * getTopPrice
 * @param {Object} payload
 */
export const getTopPrice=({bids})=>{
    return getTopPriceFactory({bids, increment: config.increment})
}

/**
 * getTopPriceFactory
 * @param {Object} payload
 */
export const getTopPriceFactory=({bids, increment})=>{
    const newBids = bids.sort(utils.sortOrder).reverse()[0]
    return parseFloat(utils.plus(newBids.price, increment))
}

export const getExpectedCost = ({sellPrice, profitPercentage}) => {
    // (x-y)/y*100 = z
    // y = 100x/(z+100) !=-100
    // return 100*sellPrice/(profitPercentage+100)
    const cost = utils.div(utils.multi(100, sellPrice), utils.plus(profitPercentage,100))
    return cost
}



export const getLimitProfitBuyOrderFy = ({asks, bids, profitPercentage }) => {
    const lowestAskPrice = lib.getLowestAskFy({asks}).price
    const newBids = bids.filter(b=>{
        return b.price < getExpectedCost({sellPrice: lowestAskPrice, profitPercentage})
    })
    return newBids
}   

export const getLimitProfitBuyOrder = ({asks, bids}) => {
    const profitPercentage = config.profitLimitPercentage
    return getLimitProfitBuyOrderFy({asks, bids, profitPercentage})
}

export const inBidPriceBucket = ({bids, buyOrder})=>{
    const bidPrice = bids.map(a=>parseFloat(a.price))
    if (bidPrice.includes(parseFloat(buyOrder.price)))return true
    return false
}


export const getValidQuantityCompareFy = ({bids, buyOrder, quantityComparePercentage})=>{
    const original = JSON.parse(JSON.stringify(bids))
    const temp = JSON.parse(JSON.stringify(bids))
    const bidsA = temp.sort(utils.sortOrder)
    
    const bidsB = bidsA.filter(b=>b.price>buyOrder.price)
    let acc = 0
    const bidsC = bidsB.map(c=>{
        acc+=c.size
        // accumulation percentage
        const accp = utils.div(acc,buyOrder.size)
        return Object.assign(c, {accp})
    })
    const bidsD = bidsC.filter(d=>d.accp<utils.div(quantityComparePercentage,100))

    const newBids = bids.filter(nb=>{
        const ans = bidsD.filter(e=>e.price===nb.price)
        return  (ans.length===0) 
    })
    return newBids
    
}

export const getValidQuantityCompare=({bids, buyOrder})=>{
    const quantityComparePercentage = config.quantityComparePercentage
    return getValidQuantityCompareFy({bids, buyOrder, quantityComparePercentage})
}