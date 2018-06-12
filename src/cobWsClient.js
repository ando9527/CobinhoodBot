// @flow
import dotenv from 'dotenv'
import config from './config'
import store from './store'
import { onSellOrderUpdate } from './actions/sellOrder'
import { haltProcess } from './utils/utils'
import logger from './utils/winston';
import { onBuyOrderUpdate } from './actions/buyOrder';
import { setOrderBook, updateOrderBook } from './actions/orderBook';
import { packageOrder } from './lib/lib';
import type { SellOrder } from './types/sellOrder';
import type { BuyOrder } from './types/buyOrder';
dotenv.load()
const WS = require('ws')
let client = null
export let connected = false
let connecting = false
export let orderBookNewest = false
export const setOrderBookNewest = (status: boolean) => {
  orderBookNewest = status
}


const connect = () => {
  if (connecting || connected) return
  connecting = true
  // if (!process.env.BOT_COB_WS_URL) throw new Error("Please setup process.env.BOT_COB_WS_URL")
  const wsURL = process.env.BOT_COB_WS_URL||"wss://ws.cobinhood.com/v2/ws"
  logger.info(`[Websocket][Cobinhood] WS connecting to ${wsURL}`)
  client = new WS(wsURL, [], {
    headers: {
      authorization: process.env.BOT_API_SECRET,
      // "nonce": new Date()*1000000 ,
    },
  })
  // client = new WS(wsURL, [],)
  client.on('open', function(data) {
    logger.info('[Websocket][Cobinhood] WS opened')
    connecting = false
    connected = true
    if (client===null) throw new Error('Client is null')

    client.send(
      JSON.stringify({
        action: 'subscribe',
        type: 'order-book',
        trading_pair_id: config.symbol,
      }),
    )

    client.send(
      JSON.stringify({
        action: 'subscribe',
        type: 'order',
        trading_pair_id: config.symbol,
      }),
    )
  })

  client.on('close', function(data) {
    logger.info('[Websocket][Cobinhood] WS close')
    if (data) logger.info(JSON.parse(data))
    connecting = false
    connected = false
  })

  client.on('message', async data => {
    const { h: header, d: dataPayload } = JSON.parse(data)
    // [channel_id, version, type, request_id (optional)]
    const channelId = header[0]
    const type = header[2]

    if (type === 's' && channelId.startsWith('order-book')) {
      store.dispatch(setOrderBook({ payload: zipOrderBook(dataPayload) }))
      orderBookNewest = true
      return 
    }
    if (type === 'u' && channelId.startsWith('order-book')) {
      store.dispatch(updateOrderBook({ payload: zipOrderBook(dataPayload) }))
      orderBookNewest = true
      return
    }
    /**
     * sync cobinhood order book data
     */
    if (type === 'u' && channelId.endsWith('order')) {
      const order = zipOrder(dataPayload)

      const { event, id } = order
      if (id === config.sellOrderId && config.mode.toLowerCase()==="ask") {
        const eventTypes = ['modified','opened', "partially_filled"]
        if (eventTypes.includes(event)) {
          
          store.dispatch(onSellOrderUpdate({ payload: packageOrder({order}) }))
          if(event==="balance_locked") logger.info(event);
          
        } else {
          await haltProcess(`This order might be done, event: ${event}, data: ${data}`)
        }
        return
      }

      if (id === config.buyOrderId && config.mode.toLowerCase()==="bid") {
        const eventTypes = ['modified','opened', "partially_filled"]
        if (eventTypes.includes(event)) {
          store.dispatch(onBuyOrderUpdate({ payload: packageOrder({order}) }))
          if(event==="balance_locked") logger.info(event);
          
        } else {
          await haltProcess(`This order might be done, event: ${event}, data: ${data}`)
        }
        return
      }
      return
    }

    if (type === 'error'){
      const errorMessage = header[4] 
      // {"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}
      if (errorMessage==="balance_locked") return logger.info('balance_locked');
      await haltProcess(`WS error:${data}`)
    }
    
  })
  client.addEventListener('error', (err) =>{
    connecting = false
    connected = false
    logger.warn(`[Websocket][Cobinhood] Error event listener ${err.message}`)
  })
}

export const startSync = () => {
  setInterval(async () => {
    if (connected) return
    connect()
  }, 3500)

  /**
   * require ping every 20 sec or disconnection
   */
  setInterval(() => {
    if (!connected) return
    if (client===null) throw new Error('Client is null')
    client.send(
      JSON.stringify({
        action: 'ping',
      }),
    )
  }, 20000)
}

const zipOrderBook = orderBook => {
  const newAsk = orderBook.asks.map(a =>
    Object.assign({}, { price: parseFloat(a[0]), count: parseFloat(a[1]), size: parseFloat(a[2]) }),
  )
  const newBid = orderBook.bids.map(a =>
    Object.assign({}, { price: parseFloat(a[0]), count: parseFloat(a[1]), size: parseFloat(a[2]) }),
  )
  return { bids: newBid, asks: newAsk }
}

export const zipOrder = (order: Array<string|number>) => {
  const id = order[0]
  const timestamp = parseFloat(order[1])
  const trading_pair_id = order[3]
  const state = order[4]
  const event = order[5]
  const side = order[6]
  const price = parseFloat(order[7])
  const eq_price = parseFloat(order[8])
  const size = parseFloat(order[9])
  const filled = parseFloat(order[10])

  return Object.assign(
    {},
    { id, timestamp, trading_pair_id, state, event, side, price, eq_price, size, filled },
  )
}

export const wsModifyOrder = async ({ price, order }:{price: number, order: SellOrder| BuyOrder}) => {
  if (!connected) throw new Error('WS disconnet, unable to modify order')
  if (client===null) throw new Error('Client is null')
  if (order===null) throw new Error('Order is null')
  const {id, size} = order
  client.send(
    JSON.stringify({
      action: 'modify_order',
      type: '0', // Type enum above
      order_id: `${id}`,
      price: `${price}`,
      size: `${size}`,
      // "stop_price": "",        // mandatory for stop/stop-limit order
      // "trailing_distance": "", // mandatory for trailing stop order
      id: `modify-order-${id}`,
    }),
  )
}
