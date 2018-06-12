// @flow
import dotenv from 'dotenv'
import * as axiosConfig from './axiosConfig'
dotenv.load()
const message = "Environment Variable Error"


if (!process.env.BOT_SMALLEST_INCREMENT) throw new Error(message)
const increment = parseFloat(process.env.BOT_SMALLEST_INCREMENT)
const decrement = increment

if (!process.env.BOT_PRODUCT_TYPE) throw new Error(message)
const productType = process.env.BOT_PRODUCT_TYPE.toUpperCase()

if (!process.env.BOT_ASSET_TYPE) throw new Error(message)
const assetType = process.env.BOT_ASSET_TYPE.toUpperCase()

if(!process.env.BOT_API_SECRET) throw new Error(message)
const apiSecret = process.env.BOT_API_SECRET

if(!process.env.BOT_WATCH_ONLY)throw new Error(message)
const watchOnly = process.env.BOT_WATCH_ONLY==="true"

if(!process.env.BOT_MODE) throw new Error(message)
const mode = process.env.BOT_MODE.toUpperCase()

if(!process.env.BOT_QUANTITY_COMPARE_PERCENTAGE)throw new Error(message)
const quantityComparePercentage = parseFloat(process.env.BOT_QUANTITY_COMPARE_PERCENTAGE)

if(!process.env.BOT_PROFIT_LIMIT_PERCENTAGE) throw new Error(message)
const profitLimitPercentage = parseFloat(process.env.BOT_PROFIT_LIMIT_PERCENTAGE)

if (!process.env.BOT_IFTTT_ENABLE) throw new Error(message)
const iftttEnable = process.env.BOT_IFTTT_ENABLE==="true"

if (!process.env.BOT_IFTTT_EVENT) throw new Error(message)
const iftttEvent= process.env.BOT_IFTTT_EVENT

if (!process.env.BOT_IFTTT_KEY) throw new Error(message)
const iftttKey = process.env.BOT_IFTTT_KEY

if(mode==="BID" && !process.env.BOT_CHECK_INTERVAL) throw new Error(message)
const BOT_CHECK_INTERVAL = process.env.BOT_CHECK_INTERVAL?parseFloat(process.env.BOT_CHECK_INTERVAL):30

if(mode==="BID" && !process.env.BOT_BUY_ORDER_ID) throw new Error(message)
const buyOrderId = process.env.BOT_BUY_ORDER_ID?process.env.BOT_BUY_ORDER_ID:"NONE"

if(mode==="BID" && !process.env.BOT_TOTAL_PRICE_LIMIT) throw new Error(message)
const totalPriceLimit = process.env.BOT_TOTAL_PRICE_LIMIT?parseFloat(process.env.BOT_TOTAL_PRICE_LIMIT):999999999999999999999999999

if(mode==="BID" && !process.env.BOT_OP_PERCENTAGE)throw new Error(message)
const opPercentage = process.env.BOT_OP_PERCENTAGE?parseFloat(process.env.BOT_OP_PERCENTAGE):9999999999999999999999999999

if(mode==="BID" && !process.env.BOT_API_URL) throw new Error(message)
const BOT_API_URL = process.env.BOT_API_URL?process.env.BOT_API_URL:"NONE"

if(mode==="BID" && !process.env.BOT_OP_WS_URL) throw new Error(message)
const BOT_OP_WS_URL= process.env.BOT_OP_WS_URL?process.env.BOT_OP_WS_URL:"NONE"

if(mode==="ASK" && !process.env.BOT_SELL_ORDER_ID) throw new Error(message)
const sellOrderId = process.env.BOT_SELL_ORDER_ID?process.env.BOT_SELL_ORDER_ID: "NONE"

if(mode==="ASK" && !process.env.BOT_PRODUCT_COST)throw new Error(message)
const productCost = process.env.BOT_PRODUCT_COST?parseFloat(process.env.BOT_PRODUCT_COST):9999999999999999999999999

const config={
  // increment : 0.0000001,
  // decrement: 0.0000001,
  increment,
  decrement,  
  /**
   * Both mode required.
   */
  apiSecret,
  watchOnly,
  mode,
  assetType,
  productType ,
  symbol: `${productType}-${assetType}`,
  quantityComparePercentage,
  profitLimitPercentage,

  /**
   * IFTTT Setup
   */
  iftttEnable,
  iftttEvent,
  iftttKey,

  /**
   * BID MODE
   */
  buyOrderId,
  totalPriceLimit,
  opPercentage,
  BOT_API_URL,
  BOT_OP_WS_URL,
  BOT_CHECK_INTERVAL,
  
  /**
   * ASK MODE
   */
  sellOrderId,
  productCost,


}

export default config