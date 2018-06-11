// @flow
import utils from '../utils'
import config from '../config'
import store from '../store'
import Cobinhood from 'cobinhood-api-node'
import axios from 'axios'
import { onBuyOrderUpdate } from '../store/buyOrder';
import { onSellOrderUpdate } from '../store/sellOrder';
import packageJson from '../../package.json'
import { updateWOB, setWOB } from '../actions/wob';
import logger from '../utils/winston';
import { onOpPriceUpdate } from '../actions/opPrice';
export const api = Cobinhood({
    apiSecret: config.apiSecret,
})
/**
 * Crypto Compare Last trade
 * @param {Object} payload
 * @param {string} payload.from
 * @param {string} payload.to
 * @returns {number} 
 */
export const getCCPrice =async({from, to}: {from: string, to: string})=>{    
    
    try {
        
        const url = `${config.BOT_API_URL}/${from.toLowerCase()}/${to.toLowerCase()}`
        const data = await axios.get(url)
        if (!data.data.data) throw new Error(`${from.toLowerCase()} is not available in ${url}`)
        return parseFloat(data.data.data)
    } catch (error) {
        throw new Error(`Get price from ${config.BOT_API_URL} Failed, ${error}`)
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
export const getCGPrice =async({from, to}:  {from: string, to: string})=>{    
    const url = `https://crypto.nctu.me/api/cg/${from.toLowerCase()}/${to.toLowerCase()}`    
    const data = await axios.get(url)
    return parseFloat(data.data.data)
}




/**
 * Modify Order
 * @param {Object} payload
 */

export const modifyOrder=async({price, order}: {price: number, order: Object})=>{
    const currentOrder = order
    try {
        const {success} = await api.modifyOrder({order_id: currentOrder.id, trading_pair_id: currentOrder.trading_pair_id, price: price.toString(), size: currentOrder.size.toString()})   /*eslint-disable camelcase*/      // eslint-disable-line
        if(success!== true) throw new Error(`Failed to modify order, price: ${JSON.stringify(price)}, current order: ${JSON.stringify(currentOrder)}`)
        const editMessage = `You have modified your order to the price ${price}`
        logger.info(editMessage)
    } catch (error) {
        throw new Error(`Failed to modify order, price: ${JSON.stringify(price)}, current order: ${JSON.stringify(currentOrder)} ${error.message}`)
    }
}


/**
 * Get information of current order
 * @return {Object} order
 */
export const getCurrentOrder=async()=>{

    try {
        let order_id = null
        if (config.mode==="BID"){
            order_id = config.buyOrderId
        }else if(config.mode==="ASK"){
            order_id = config.sellOrderId
        }
        const data = await api.myOrderId({order_id})  // eslint-disable camelcase  

        if (data.success === false) throw new Error(`Can not retrieve your order from server, Error ${data}`)
        const {order} = data.result
        if (order.state==="filled") throw new Error(`This order is not available right now.`)
        logger.info(`Current Order Information, id: ${order.id}, symbol: ${order.trading_pair_id}, side: ${order.side}, price: ${order.price}, size: ${order.size}, config profit: ${config.profitLimitPercentage}%`)
        return packageOrder({order})
    } catch (error) {
        throw new Error(`Failed to get current order ${error}`)
        
    }



}

export const packageOrder=({order}: {order: Object})=>{
    const {id, trading_pair_id, side, type, price, size, filled, state, timestamp, eq_price, completed_at} = order   // eslint-disable-line camelcase
    return  {id, trading_pair_id, side, type, price: parseFloat(price), size: parseFloat(size), filled: parseFloat(filled), state, timestamp: timestamp.toString(), eq_price:parseFloat(eq_price), completed_at } // eslint-disable-line
}

export const checkProfitLimitPercentage = ({profitPercentage}: {profitPercentage: number}) => {
    // due to top price minus/plus 0.0000001 
    if (utils.plus(profitPercentage,1)< parseFloat(config.profitLimitPercentage)){
        const message = JSON.stringify(store.getState())
        throw new Error(`'Under cost price but not detected, plz contact the bot author'.${message}`)
    }
}

export const getLowestAsk=()=>{
    const {asks} = store.getState().orderBook 
    return getLowestAskFy({asks})
}

export const getLowestAskFy=({asks}: {asks: Object})=>{
    const ask =  asks.sort(utils.sortOrder)[0]
    return ask
}

export const getHighestBid=()=>{
    const {bids} = store.getState().orderBook 
    return getHighestBidFy({bids})
}

export const getHighestBidFy=({bids}: {bids: Object})=>{
    const bid =  bids.sort(utils.sortOrder).reverse()[0]
    return bid
}

export const getProfitPercentage = ({price, productCost}: {price: number, productCost: number}) => {
    const spread = utils.minus(price, productCost)
    const fraction = utils.div(spread, productCost)
    const profit = parseFloat(utils.multi(fraction,100).toFixed(2))
    return profit
}

/**
 * @param {Object} payload
 * @param {string} payload.env
 * @param {string} payload.attr
 * @param {Array} payload.requires
 */
export const verifyConfigFactory = ({env, attr, requires = []}: {env: string, attr: string, requires?: Array<string>}) => {
    if(!env) throw new Error("You need to pass a env string.")
    if (!attr) throw new Error('You need to pass a config attribute.')    
    if(!process.env.hasOwnProperty(env)) throw new Error(`Please setup ${env}`)
    if(!config.hasOwnProperty(attr)) throw new Error(`Config attribute issue, contact bot author plz ${attr} ${JSON.stringify(config)}`)
    
    if (requires.length===0) return true
    if(!requires.includes(process.env[env])) throw new Error(`${env} ENV, please use ${requires.toString()}`)
}


export const commonVerifyConfig = async() => {
    logger.info(`Version ${packageJson.version}`)
    logger.info('Verifying your configuration..')
    /**
     * Check API Secret
     * BOT_API_SECRET
     */
    verifyConfigFactory({env: "BOT_API_SECRET", attr: "apiSecret"})
    try {
        await api.balances()
    } catch (error) {
        throw new Error(`API Secret is no valid. ${error.message}`)
    }
    /**
     * Check Ifttt
     * BOT_IFTTT_ENABLE
     */
    verifyConfigFactory({env: "BOT_IFTTT_ENABLE", attr: "iftttEnable", requires: ["true", "false"]})
    if (config.iftttEnable===true){
        verifyConfigFactory({env: "BOT_IFTTT_EVENT", attr: "iftttEvent"})
        verifyConfigFactory({env: "BOT_IFTTT_KEY", attr: "iftttKey"})
    }

    if (config.iftttEnable===true){
        verifyConfigFactory({env: "BOT_IFTTT_EVENT", attr: "iftttEvent"})
        verifyConfigFactory({env: "BOT_IFTTT_KEY", attr: "iftttKey"})
    }

 

    /**
     * check smallest increment
     */
    verifyConfigFactory({env: "BOT_SMALLEST_INCREMENT", attr:"increment"})
    verifyConfigFactory({env: "BOT_SMALLEST_INCREMENT", attr:"decrement"})


    /**
     * Check ENV  BID & ASK both required
     */
    // BOT_WATCH_ONLY
    verifyConfigFactory({env: "BOT_WATCH_ONLY", attr: "watchOnly",  requires: ["true", "false"]})
    // BOT_INTERVAL_SECOND
    verifyConfigFactory({env: "BOT_INTERVAL_SECOND", attr: "intervalSecond"})
    if (config.intervalSecond<30) throw new Error('Please setup BOT_INTERVAL_SECOND, larger than 30 sec')
    // BOT_MODE
    verifyConfigFactory({env: "BOT_MODE", attr: "mode", requires:["bid", "ask", "BID", "ASK"]})
    if (!config.mode) throw new Error('Please setup BOT_MODE')
    // BOT_ASSET_TYPE
    verifyConfigFactory({env: "BOT_ASSET_TYPE", attr: "assetType", requires:['ETH', 'USDT', 'BTC', 'eth', 'usdt', 'btc']})
    // BOT_PRODUCT_TYPE
    verifyConfigFactory({env: "BOT_PRODUCT_TYPE", attr: "productType"})
    const data = await api.allCurrencies()
    const ans = data.result.currencies.filter(coin=> coin.currency===config.productType)
    if(!ans===1) throw new Error('Please setup supportive BOT_PRODUCT_TYPE')
    verifyConfigFactory({env: "BOT_PROFIT_LIMIT_PERCENTAGE", attr: "profitLimitPercentage"})
    verifyConfigFactory({env: "BOT_QUANTITY_COMPARE_PERCENTAGE", attr: "quantityComparePercentage"})
    if (parseFloat(config.profitLimit)>1000) throw new Error('Profit limit Percentage over 1000, something must wrong here')
    if (parseFloat(config.profitLimit)<0) throw new Error('Profit limit Percentage is negative, something must wrong here')

}



/**
 * Update order/order book/balance/opPrice data
 */
export const updateData=async()=>{
    if (config.mode==="BID"){
        const buyOrder = await getCurrentOrder()
        store.dispatch(onBuyOrderUpdate({payload:buyOrder}))
        const opPrice = await getCCPrice({from: config.productType, to: config.assetType})
        store.dispatch(onOpPriceUpdate({payload: {price:opPrice}}))
    }else if(config.mode === "ASK"){
        const sellOrder = await getCurrentOrder()
        store.dispatch(onSellOrderUpdate({payload:sellOrder}))
    }
    
    
    const orderBook = await api.orderBooks({trading_pair_id: config.symbol})   // eslint-disable-line
    const newOrderBook = packageOrderBook({orderBook})
    store.dispatch(setWOB({payload: newOrderBook}))
    
    
    
}


export const packageOrderBook= ({orderBook}: {orderBook: Object})=>{
    const asks = orderBook.asks.map(a=>{
        return {price: parseFloat(a.price), count: parseFloat(a.count), size: parseFloat(a.size)}
    })
    const bids = orderBook.bids.map(b=>{
        return {price: parseFloat(b.price), count: parseFloat(b.count), size: parseFloat(b.size)}
    })   
    return {asks,bids}
}
