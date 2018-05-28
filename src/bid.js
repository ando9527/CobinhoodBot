import config from './config'
import utils from './utils'
import store from './reducer'
import lib from './lib'
import bidLib from './bidLib'



export const initial=async()=>{
    await bidLib.verifyConfig()
}

export const bidStateMachine=()=>{
    const {orderBook, buyOrder, opPrice} = store.getState()
    const {asks, bids} = orderBook    
    const vQCBids = bidLib.getValidQuantityCompare({bids, buyOrder})
    const lPBOBids = bidLib.getLimitProfitBuyOrder({bids:vQCBids, asks})
    if (lPBOBids.length<=1) return "ZERO_LIMIT_PROFIT_BUY_ORDER"
    const oBids = bidLib.getBelowOpBuyOrder({bids:lPBOBids, opPrice})
    if (oBids.length<=1) return "ZERO_BELOW_OP_PRICE" 
    const lBids = bidLib.getBelowLimitBuyOrder({bids: oBids, buyOrder, limit: config.totalPriceLimit})
    if (lBids.length<=1) return "ZERO_BELOW_LIMIT_PRICE"
    const ib =  bidLib.inBidPriceBucket({bids: lBids, buyOrder})
    if (ib === false) return "BE_TOP"
    const ih = bidLib.isHighestBidOrder({bids: lBids, buyOrder})
    if(ih === false)return "BE_TOP"
    const ir = bidLib.isReducePrice({bids:lBids, buyOrder, increment: config.increment})
    if(ir === false) return "NOTHING"
    if(ir === true) return "REDUCE_PRICE"
}

export const check=async()=>{
    // For Logic
    await lib.updateData()
    const code = bidStateMachine()
    const {opPrice, buyOrder, orderBook} = store.getState() 
    const {asks, bids} = orderBook
    const vQCBids = bidLib.getValidQuantityCompare({bids, buyOrder})
    const lPBOBids = bidLib.getLimitProfitBuyOrder({bids: vQCBids, asks})
    const oBids = bidLib.getBelowOpBuyOrder({bids:lPBOBids, opPrice})
    const lBids = bidLib.getBelowLimitBuyOrder({bids: oBids, buyOrder, limit: config.totalPriceLimit})
    // Expected Profit Percentage
    const epp = lib.getProfitPercentage({price: lib.getLowestAsk().price , productCost: buyOrder.price})
    const eppInfo = `${epp}%`
    const lowestAsk = lib.getLowestAsk().price
    // For Info
    const highestPrice = lib.getHighestBid().price
    utils.green(`Yours: ${buyOrder.price}(${eppInfo}) Highest Bid: ${highestPrice}(${lib.getProfitPercentage({price: lowestAsk, productCost: highestPrice})}%) Lowest Ask: ${lowestAsk} ${config.BOT_API_URL}: ${opPrice}(${lib.getProfitPercentage({price: opPrice, productCost: buyOrder.price})}%).`)
    
    if (code=== "ZERO_LIMIT_PROFIT_SELL_ORDER") throw new Error("Price of buy orders on the list break your profit limit.")    
    if (code==="ZERO_BELOW_OP_PRICE" ) throw new Error("Price of orders on list with your order size is higher than external exchange  price")
    if (code==="ZERO_BELOW_LIMIT_PRICE") throw new Error("Prices of orders on list with your order size is higher than limit price which you set")

 

    if (code==="NOTHING"){
        // will throw error if state machine logic is wrong 
        bidLib.checkOverLimit({price: buyOrder.price, priceModified, buyOrder, opPrice, totalPriceLimit: config.totalPriceLimit})
        lib.checkProfitLimitPercentage({profitPercentage: epp})
        utils.myLog("Your offer is good, you don't need to change.")  
        return "NOTHING"
    } 
    
    let priceModified = 0
    let changeMessage = ""
    if (code==="BE_TOP"){
        priceModified = bidLib.getTopPrice({bids: lBids})
        changeMessage = "Rasing Price"
    }
    if (code==="REDUCE_PRICE"){
        priceModified = bidLib.getReducePrice({bids:lBids})
        changeMessage = "Reducing Price"
    } 
    
    if (priceModified=== buyOrder.price){
        console.log("PRICE the same, do nothing here, temporary bug... will fix soon")
        return "NOTHING_BUG"
    }
    // Modified Expected Profit Percentage 
    const mepp =lib.getProfitPercentage({ price: lib.getLowestAsk().price, productCost:priceModified})
    utils.yellow(`${priceModified}(${mepp}%) ${changeMessage}` )
    


    if (config.watchOnly===true){
        utils.cyan((`You are in watch mode now, nothing to do here `))
        return "WATCH_ONLY"
    }
    /**
     * will throw error if state machine logic is wrong 
     */
    bidLib.checkOverLimit({price: priceModified, buyOrder, opPrice, totalPriceLimit: config.totalPriceLimit})
    lib.checkProfitLimitPercentage({profitPercentage: mepp})
    await bidLib.checkEnoughBalance({price: priceModified})
    await lib.modifyOrder({price:priceModified, order: buyOrder})
    
}


export const run=async()=>{
    try {
        await initial()
        await check()
    } catch (error) {
        const record = utils.removeProperty(store.getState(), "config")
        console.log('real time data==================================')
        console.log(JSON.stringify(record))
        console.log(`end real time data===============================`)
        throw error
    }

    const id = setInterval(async()=>{
        try {
            utils.myLog("")
            await check()
            
        } catch (error) {
            clearInterval(id)
            console.log(error.message)

            const record = utils.removeProperty(store.getState(), "config")
            await utils.sendIfttt(`${config.mode} - ${config.symbol} - ${error.message}`, JSON.stringify(record))
            
            throw error
        }
    }, config.intervalSecond * 1000)
}


