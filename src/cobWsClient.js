// @flow

import type { WsEvent, WsState, WsOrder } from './types/cobWs'
import type { SellOrder } from './types/sellOrder'
import type { BuyOrder } from './types/buyOrder'
import store from './store'
import { onSellOrderUpdate } from './actions/sellOrder'
import { sendIfttt } from './utils/utils'
import logger from './helpers/sentry'
import { onBuyOrderUpdate } from './actions/buyOrder'
import { setOrderBook, updateOrderBook } from './actions/orderBook'
import { packageOrder } from './lib/lib'

const WS = require('ws')
let client = null
export let connected = false
let connecting = false
export let orderBookNewest = false
export const setOrderBookNewest = (status: boolean) => {
  orderBookNewest = status
}

const connect = option => {
  if (connecting || connected) return
  connecting = true
  if (!process.env.BOT_COB_WS_URL) throw new Error('Please setup process.env.BOT_COB_WS_URL')
  const wsURL = process.env.BOT_COB_WS_URL || 'wss://ws.cobinhood.com/v2/ws'
  logger.info(`[Websocket][Cobinhood] WS connecting to ${wsURL}`)

  if (wsURL === 'wss://ws.cobinhood.com/v2/ws') {
    client = new WS(wsURL, [], {
      headers: {
        authorization: process.env.BOT_API_SECRET,
        // "nonce": new Date()*1000000 ,
      },
    })
  } else {
    client = new WS(wsURL, [])
  }

  client.on('open', function(data) {
    logger.info('[Websocket][Cobinhood] WS opened')
    connecting = false
    connected = true
    if (client === null) throw new Error('Client is null')

    client.send(
      JSON.stringify({
        action: 'subscribe',
        type: 'order-book',
        trading_pair_id: option.symbol,
      }),
    )

    client.send(
      JSON.stringify({
        action: 'subscribe',
        type: 'order',
        trading_pair_id: option.symbol,
      }),
    )
  })

  client.on('close', function(data) {
    logger.info('[Websocket][Cobinhood] WS close')
    if (data) logger.info(JSON.parse(data))
    connecting = false
    connected = false
  })

  client.on('message', async rawOnMessage => {
    processOnMessage(rawOnMessage)
  })
  client.addEventListener('error', err => {
    connecting = false
    connected = false
    logger.warn(`[Websocket][Cobinhood] Error event listener ${err.message}`)
  })
}

export const startSync = (option: any) => {
  setInterval(async () => {
    if (connected) return
    connect(option)
  }, 3500)

  /**
   * require ping every 20 sec or disconnection
   */
  setInterval(() => {
    if (!connected) return
    if (client === null) throw new Error('Client is null')
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

export const zipOrderStateMessage = (order: Array<any>): WsOrder => {
  const id = order[0]
  const timestamp = parseFloat(order[1])
  const trading_pair_id = order[3]

  const state: WsState = order[4]
  const event: WsEvent = order[5]
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

export const wsModifyOrder = async ({
  price,
  order,
}: {
  price: number,
  order: SellOrder | BuyOrder,
}) => {
  if (!connected) throw new Error('WS disconnet, unable to modify order')
  if (client === null) throw new Error('Client is null')
  if (order === null) throw new Error('Order is null')
  const { id, size } = order
  const sendBack = JSON.stringify({
    action: 'modify_order',
    type: '0', // Type enum above
    order_id: `${id}`,
    price: `${price}`,
    size: `${size}`,
    // "stop_price": "",        // mandatory for stop/stop-limit order
    // "trailing_distance": "", // mandatory for trailing stop order
    id: `modify-order-${id}`,
  })
  logger.debug(`[Websocket][Cobinhood] Modify Order ${JSON.stringify(sendBack)}`)
  client.send(sendBack)
}

export const dispatchOrder = ({ order, mode }: { order: any, mode: any }) => {
  if (mode === 'ask') return store.dispatch(onSellOrderUpdate({ payload: packageOrder({ order }) }))
  if (mode === 'bid') return store.dispatch(onBuyOrderUpdate({ payload: packageOrder({ order }) }))
}

export const processOnMessage = ({ rawOnMessage, option }: { rawOnMessage: any, option: any }) => {
  const { h: header, d: data } = JSON.parse(rawOnMessage)
  // [channel_id, version, type, request_id (optional)]
  const channelId = header[0]
  const type = header[2]
  if (type === 's' && channelId.startsWith('order-book')) {
    store.dispatch(setOrderBook({ payload: zipOrderBook(data) }))
    orderBookNewest = true
    return 'ORDER_BOOK_SNAP'
  }
  if (type === 'u' && channelId.startsWith('order-book')) {
    store.dispatch(updateOrderBook({ payload: zipOrderBook(data) }))
    orderBookNewest = true
    return 'ORDER_BOOK_UPDATE'
  }
  /**
   * sync cobinhood order book data
   */
  if (type === 'u' && channelId.endsWith('order')) {
    return processOrderMessage({ data, rawOnMessage, option })
  }

  const errorMessage = header[4]
  if (type === 'error') {
    return processErrorMessage({ errorMessage, rawOnMessage })
  }
}

export const processOrderMessage = ({
  data,
  rawOnMessage,
  option,
}: {
  data: any,
  rawOnMessage: any,
  option: any,
}) => {
  const order = zipOrderStateMessage(data)
  const { event, id, state }: { event: WsEvent, id: string, state: WsState } = order

  if (id !== option.sellOrderId && id !== option.buyOrderId) return 'IRRELEVANT_ORDER'

  const eventTypes: Array<WsEvent> = ['modified', 'opened', 'executed']

  if (eventTypes.includes(event)) {
    dispatchOrder({ order, mode: option.mode.toLowerCase() })
  } else if (event === 'modify_rejected') {
    logger.warn(event)
    logger.record(event, { tags: { reject: 'modify_rejected' }, extra: { orderId: id } })
    return 'MODIFY_REJECTED'
  } else if (event === 'executed' && state === 'partially_filled') {
    const message = `Your order partially filled: ${option.symbol} ${id}`
    logger.info(message)
    sendIfttt({ value1: message, option })
  } else if (event === 'executed' && state === 'filled') {
    const message = `Your order full filled: ${option.symbol} ${id}`
    logger.info(message, (option = option))
    sendIfttt({ value1: message, option })
  } else if (event === 'cancelled' && state === 'cancelled') {
    const message = `Your order full filled: ${option.symbol} ${id}`
    logger.info(message)
  } else {
    logger.recordHalt('Unexpected WS Code', { extra: { rawOnMessage } })
  }
}
export const processErrorMessage = ({
  errorMessage,
  rawOnMessage,
}: {
  errorMessage: string,
  rawOnMessage: string,
}) => {
  if (errorMessage === 'balance_locked') {
    logger.warn('balance_locked')
    return 'BALANCE_LOCKED'
  }
  logger.recordHalt('Unexpected WS Code', { extra: { rawOnMessage } })
}
