'use strict';
import config from 'config'

import bidLib from 'bidLib'
import Cobinhood from 'cobinhood-api-node'
import store from 'reducer'
import test from 'ava'
import lib from 'lib'
var api = Cobinhood({
    apiSecret: config.apiSecret
});

// const debug_store = {"buyOrder":{"id":"0b74e76a-2174-44c4-bfe7-2e8d47ee10e0","trading_pair":"IOST-ETH","side":"bid","type":"limit","price":0.0000326,"size":11000,"filled":0,"state":"open","timestamp":1521266975627,"eq_price":0,"completed_at":null},"balance":null,"orderBook":{"asks":[{"price":0.000038,"count":1,"size":5844.296},{"price":0.0000381,"count":1,"size":2451.0692903},{"price":0.0000382,"count":1,"size":3000},{"price":0.0000385,"count":1,"size":16800.74741638},{"price":0.0000386,"count":1,"size":1100},{"price":0.0000399,"count":1,"size":5000},{"price":0.00004,"count":1,"size":39999},{"price":0.0000421,"count":1,"size":4003.22598392},{"price":0.000043,"count":1,"size":10000},{"price":0.0000439,"count":1,"size":15000},{"price":0.0000444,"count":1,"size":9840},{"price":0.000045,"count":1,"size":7409.60307672},{"price":0.0000466,"count":1,"size":13920},{"price":0.0000472,"count":1,"size":2000},{"price":0.0000499,"count":1,"size":5000},{"price":0.00005,"count":2,"size":5112.32166897},{"price":0.000059,"count":1,"size":2500},{"price":0.0000592,"count":1,"size":2000},{"price":0.0000665,"count":1,"size":2815.0012},{"price":0.0000666,"count":1,"size":3000},{"price":0.000069,"count":1,"size":5000},{"price":0.0000812,"count":1,"size":5000},{"price":0.0000828,"count":1,"size":2853.39999999},{"price":0.000087,"count":1,"size":3268.21764042},{"price":0.000109,"count":1,"size":4500},{"price":0.0001489,"count":1,"size":5000},{"price":0.000149,"count":1,"size":4700},{"price":0.0001512,"count":1,"size":5000},{"price":0.0001986,"count":1,"size":3000},{"price":0.0001987,"count":1,"size":6548.22201202},{"price":0.0001988,"count":1,"size":35000},{"price":0.000199,"count":2,"size":12645.79904892},{"price":0.000279,"count":1,"size":2000},{"price":0.0002893,"count":1,"size":40000},{"price":0.0002898,"count":1,"size":2000},{"price":0.0002912,"count":1,"size":3000},{"price":0.0004396,"count":1,"size":2000},{"price":0.0004899,"count":1,"size":3000},{"price":0.00049,"count":1,"size":5000},{"price":0.000785,"count":1,"size":3056},{"price":0.0008,"count":1,"size":5000},{"price":0.0008899,"count":1,"size":2571.6025352},{"price":0.00089,"count":1,"size":23000},{"price":0.000895,"count":1,"size":10000},{"price":0.0009,"count":1,"size":40000},{"price":0.001,"count":1,"size":10000},{"price":0.003,"count":1,"size":2000},{"price":0.00337,"count":1,"size":20578.12},{"price":0.00338,"count":1,"size":10000},{"price":0.0043999,"count":1,"size":2000}],"bids":[{"price":0.0000351,"count":2,"size":4300},{"price":0.0000327,"count":1,"size":10000},{"price":0.0000326,"count":1,"size":11000},{"price":0.0000317,"count":1,"size":1250},{"price":0.0000297,"count":1,"size":1700},{"price":0.0000268,"count":1,"size":5000},{"price":0.0000267,"count":1,"size":5000},{"price":0.0000231,"count":1,"size":10000},{"price":0.0000222,"count":2,"size":10000},{"price":0.0000217,"count":2,"size":10165.5111278},{"price":0.0000216,"count":1,"size":10373.74644377},{"price":0.0000213,"count":1,"size":100000},{"price":0.0000211,"count":2,"size":14865.55506211},{"price":0.000021,"count":1,"size":191794.25062532},{"price":0.0000199,"count":1,"size":10508.05402013},{"price":0.0000182,"count":1,"size":151579.35715429},{"price":0.0000181,"count":1,"size":20000},{"price":0.000016,"count":2,"size":7700},{"price":0.0000157,"count":2,"size":12811.89197223},{"price":0.0000156,"count":2,"size":13519.23391238},{"price":0.0000142,"count":2,"size":9197.18309858},{"price":0.0000141,"count":1,"size":152960.99999999},{"price":0.0000139,"count":1,"size":15000},{"price":0.0000138,"count":1,"size":118726.18840582},{"price":0.0000137,"count":1,"size":221000},{"price":0.0000122,"count":2,"size":23000},{"price":0.0000102,"count":1,"size":98065.38235294},{"price":0.0000101,"count":1,"size":100000},{"price":0.00001,"count":4,"size":197702.93400005},{"price":0.0000084,"count":1,"size":15000},{"price":0.000008,"count":1,"size":500000},{"price":0.0000078,"count":1,"size":10508.91},{"price":0.0000073,"count":1,"size":32926.58073189},{"price":0.0000072,"count":2,"size":110000},{"price":0.0000056,"count":1,"size":37653.48214286},{"price":0.0000053,"count":1,"size":8000},{"price":0.000005,"count":1,"size":20000},{"price":0.0000049,"count":1,"size":20000},{"price":0.0000047,"count":1,"size":16000},{"price":0.0000046,"count":1,"size":65000},{"price":0.0000045,"count":1,"size":8000},{"price":0.0000036,"count":1,"size":6000},{"price":0.000003,"count":1,"size":28341},{"price":0.0000027,"count":1,"size":10000},{"price":0.0000026,"count":2,"size":20000},{"price":0.0000025,"count":2,"size":110000},{"price":0.000002,"count":3,"size":50000},{"price":0.0000016,"count":1,"size":10125},{"price":0.0000015,"count":1,"size":30000},{"price":0.0000014,"count":1,"size":4420}]},"opPrice":0.0000378,"sellOrder":null,"orderId":null}
const debug_store={"buyOrder":{"id":"e9bae674-824e-4851-beef-82d0828ceb5f","trading_pair":"BDG-ETH","side":"bid","type":"limit","price":0.0000625,"size":4300,"filled":0,"state":"open","timestamp":1521682252288,"eq_price":0,"completed_at":null},"balance":null,"orderBook":{"asks":[{"price":0.0000889,"count":1,"size":4179.2967},{"price":0.000089,"count":1,"size":3067.9966},{"price":0.00009,"count":1,"size":4004},{"price":0.0000933,"count":2,"size":11046},{"price":0.0000954,"count":2,"size":12500},{"price":0.0000955,"count":1,"size":4428.41880341},{"price":0.0000956,"count":1,"size":1187.64480785},{"price":0.0000957,"count":1,"size":40267},{"price":0.000097,"count":1,"size":1450},{"price":0.0000974,"count":1,"size":3290.32258064},{"price":0.000105,"count":1,"size":2970},{"price":0.000108,"count":1,"size":7000},{"price":0.0001239,"count":1,"size":1545},{"price":0.000127,"count":1,"size":7000},{"price":0.00015,"count":3,"size":89687.7144422},{"price":0.000165,"count":1,"size":1000},{"price":0.00017,"count":2,"size":16510},{"price":0.000179,"count":1,"size":3000},{"price":0.000189,"count":1,"size":1726},{"price":0.00019,"count":2,"size":23885.00854456},{"price":0.0001999,"count":1,"size":1251},{"price":0.0002,"count":2,"size":4250},{"price":0.00025,"count":2,"size":41000},{"price":0.00026,"count":1,"size":5000},{"price":0.0002609,"count":1,"size":5525.44382894},{"price":0.0003,"count":1,"size":5000},{"price":0.000349,"count":1,"size":1000},{"price":0.000395,"count":1,"size":10000},{"price":0.000463,"count":1,"size":2722.67554061},{"price":0.0005,"count":2,"size":21000},{"price":0.00052,"count":1,"size":2750},{"price":0.00056,"count":1,"size":1000},{"price":0.0006,"count":1,"size":1000},{"price":0.00077,"count":1,"size":1300},{"price":0.00079,"count":1,"size":1246.228},{"price":0.0009999,"count":1,"size":1303.59051365},{"price":0.001,"count":2,"size":8399.83},{"price":0.0012345,"count":1,"size":1324.9},{"price":0.00134,"count":1,"size":1500},{"price":0.004545,"count":1,"size":1100},{"price":8.00025,"count":1,"size":1333}],"bids":[{"price":0.0000705,"count":2,"size":11200},{"price":0.0000701,"count":1,"size":1043.25},{"price":0.00007,"count":1,"size":1071.42857145},{"price":0.0000698,"count":1,"size":3123.759035},{"price":0.0000695,"count":1,"size":1747.57843292},{"price":0.000069,"count":1,"size":4976.65391304},{"price":0.0000685,"count":1,"size":1100},{"price":0.0000684,"count":1,"size":14295},{"price":0.0000641,"count":1,"size":6835.62222574},{"price":0.000064,"count":2,"size":5025},{"price":0.0000626,"count":1,"size":4300},{"price":0.0000625,"count":1,"size":4300},{"price":0.0000619,"count":1,"size":5000},{"price":0.000061,"count":2,"size":12700},{"price":0.0000605,"count":1,"size":5000},{"price":0.00006,"count":1,"size":2000},{"price":0.0000595,"count":1,"size":5000},{"price":0.000058,"count":2,"size":10471.724},{"price":0.0000551,"count":1,"size":10000},{"price":0.000055,"count":2,"size":9516.232},{"price":0.000052,"count":2,"size":27500},{"price":0.0000515,"count":1,"size":7323.96640776},{"price":0.00005,"count":2,"size":4000},{"price":0.0000481,"count":1,"size":30000},{"price":0.0000462,"count":2,"size":5335.86787699},{"price":0.000046,"count":2,"size":7500},{"price":0.0000451,"count":1,"size":30000},{"price":0.000045,"count":1,"size":10107.37524182},{"price":0.0000435,"count":1,"size":1046},{"price":0.0000404,"count":1,"size":3000},{"price":0.00004,"count":1,"size":24999.99},{"price":0.0000371,"count":1,"size":1000},{"price":0.0000311,"count":1,"size":11500},{"price":0.000031,"count":1,"size":3000},{"price":0.00003,"count":2,"size":3000},{"price":0.0000247,"count":1,"size":2200},{"price":0.0000243,"count":1,"size":5000},{"price":0.00002,"count":1,"size":2000},{"price":0.000012,"count":1,"size":1000},{"price":0.000011,"count":1,"size":10000},{"price":0.00001,"count":1,"size":50000},{"price":0.0000099,"count":1,"size":1000},{"price":0.0000097,"count":1,"size":100000},{"price":0.0000095,"count":1,"size":10000},{"price":0.0000092,"count":1,"size":20000},{"price":0.000009,"count":1,"size":15000},{"price":0.0000088,"count":1,"size":19204.54545456},{"price":0.0000059,"count":1,"size":10000},{"price":0.0000056,"count":1,"size":4000},{"price":0.0000034,"count":1,"size":6258.82352955}]},"opPrice":0.00005693,"sellOrder":null,"orderId":null}
const {opPrice, buyOrder, orderBook} = debug_store
const {asks, bids} = orderBook

export const bidStateMachine=()=>{
    console.log('bid machine start')
    const {orderBook, buyOrder} = debug_store
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
    const code = bidStateMachine()
    const {opPrice, buyOrder, orderBook} = debug_store
    const {asks, bids} = orderBook
    const vQCBids = bidLib.getValidQuantityCompare({bids, buyOrder})
    const lPBOBids = bidLib.getLimitProfitBuyOrder({bids: vQCBids, asks})
    const oBids = bidLib.getBelowOpBuyOrder({bids:lPBOBids, opPrice})
    const lBids = bidLib.getBelowLimitBuyOrder({bids: oBids, buyOrder, limit: config.totalPriceLimit})
    // Expected Profit Percentage
    // const epp = lib.getProfitPercentage({price: lib.getLowestAsk().price , productCost: buyOrder.price})
    // const eppInfo = `${epp}%`
    // const lowestAsk = lib.getLowestAsk().price
    
    // // For Info
    // const highestPrice = lib.getHighestBid().price
    // utils.green(`Yours: ${buyOrder.price}(${eppInfo}) Highest Bid: ${highestPrice}(${lib.getProfitPercentage({price: lowestAsk, productCost: highestPrice})}%) Lowest Ask: ${lowestAsk} ${config.BOT_API_URL}: ${opPrice}(${lib.getProfitPercentage({price: opPrice, productCost: buyOrder.price})}%).`)
    
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
    // const mepp =lib.getProfitPercentage({ price: lib.getLowestAsk().price, productCost:priceModified})
    // utils.yellow(`${priceModified}(${mepp}%) ${changeMessage}` )
    


    // if (config.watchOnly){
    //     utils.cyan((`You are in watch mode now, nothing to do here `))
    //     return "WATCH_ONLY"
    // }
    // will throw error if state machine logic is wrong

    bidLib.checkOverLimit({price: priceModified, buyOrder, opPrice, totalPriceLimit: config.totalPriceLimit})
    // lib.checkProfitLimitPercentage({profitPercentage: mepp})
    // await bidLib.checkEnoughBalance({price: priceModified})
    
}

test.serial('bid machine', async t => {
    const code = bidStateMachine()
    console.log(code)
    t.pass()
})
test.serial('check', async t => {
    await check()
    t.pass()
})


test.skip('getBelowOpBuyOrderFy', async t => {

    const ans = bidLib.getBelowOpBuyOrderFy({bids, opPrice})
    console.log(ans)

})

test.serial('getBelowLimitBuyOrder', async t => {
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item=>{
        return {price:item}
    })
    const buyOrder={size:10}
    const limit = 100
    const ans = bidLib.getBelowLimitBuyOrder({bids, buyOrder, limit})
    t.deepEqual(ans, [ { price: 8 },
        { price: 7 },
        { price: 5 },
        { price: 3 },
        { price: 1 } ])
})


