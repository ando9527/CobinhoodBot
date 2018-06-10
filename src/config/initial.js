import dotenv from 'dotenv'
import { onConfigInsert } from '../reducer/config'
import store from '../reducer'
dotenv.load()
const config={
    // increment : 0.0000001,
    // decrement: 0.0000001,
    increment : parseFloat(process.env.BOT_SMALLEST_INCREMENT),
    decrement:  parseFloat(process.env.BOT_SMALLEST_INCREMENT),
    /**
     * Both mode required.
     */
    apiSecret: process.env.BOT_API_SECRET,
    intervalSecond: parseInt(process.env.BOT_INTERVAL_SECOND,10),
    watchOnly: process.env.BOT_WATCH_ONLY==="true",
    mode: process.env.BOT_MODE.toUpperCase(),
    assetType: process.env.BOT_ASSET_TYPE.toUpperCase(),
    productType: process.env.BOT_PRODUCT_TYPE.toUpperCase(),
    symbol: `${process.env.BOT_PRODUCT_TYPE.toUpperCase()}-${process.env.BOT_ASSET_TYPE.toUpperCase()}`,
    quantityComparePercentage: parseFloat(process.env.BOT_QUANTITY_COMPARE_PERCENTAGE),
    profitLimitPercentage: parseFloat(process.env.BOT_PROFIT_LIMIT_PERCENTAGE),


    /**
     * BID MODE
     */
    buyOrderId: process.env.BOT_BUY_ORDER_ID,
    totalPriceLimit: process.env.BOT_TOTAL_PRICE_LIMIT? parseFloat(process.env.BOT_TOTAL_PRICE_LIMIT):process.env.BOT_TOTAL_PRICE_LIMIT,
    opPercentage: process.env.BOT_OP_PERCENTAGE?parseFloat(process.env.BOT_OP_PERCENTAGE):process.env.BOT_OP_PERCENTAGE,
    BOT_API_URL: process.env.BOT_API_URL,
    BOT_WS_URL: process.env.BOT_WS_URL,
    
    /**
     * ASK MODE
     */
    sellOrderId: process.env.BOT_SELL_ORDER_ID,
    productCost: process.env.BOT_PRODUCT_COST?parseFloat(process.env.BOT_PRODUCT_COST):process.env.BOT_PRODUCT_COST,

    /**
     * IFTTT Setup
     */
    iftttEnable: process.env.BOT_IFTTT_ENABLE==="true",
    iftttEvent: process.env.BOT_IFTTT_EVENT,
    iftttKey: process.env.BOT_IFTTT_KEY,
}


export default ()=>{
    store.dispatch(onConfigInsert({payload: config}))    
}
