// @flow

import type { WsEvent, WsState, WsChannelOrder } from './types/cobWs'
import type { Option } from './types/option'
import type { SellOrder } from './types/sellOrder'
import type { BuyOrder } from './types/buyOrder'
import store from './store'
import { onSellOrderUpdate } from './actions/sellOrder'
import { sendIfttt } from './utils/utils'
import { onBuyOrderUpdate } from './actions/buyOrder'
import { setOrderBook, updateOrderBook } from './actions/orderBook'
import { packageOrder } from './lib/lib'
import logger from './helpers/logger'

const WS = require('ws')
let client = null
export let connected = false
let connecting = false
export let orderBookNewest = false
export const setOrderBookNewest = (status: boolean) => {
  orderBookNewest = status
}

const connect = option => {
  try {
  } catch (e) {}
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
    if (!rawOnMessage) return

    try {
      await processOnMessage({ rawOnMessage, option })
    } catch (e) {
      logger.error(e, option, `rawOnMessage: ${rawOnMessage}`)
    }
  })
  client.addEventListener('error', err => {
    connecting = false
    connected = false
    logger.warn(
      `[Websocket][Cobinhood] Error event listener, error code: ${err.code}, message: ${
        err.message
      }`,
    )
  })
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

export const zipChannelOrderData = (order: Array<any>): WsChannelOrder => {
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

export const dispatchOrder = ({ order, mode }: { order: WsChannelOrder, mode: string }) => {
  if (mode === 'ask') return store.dispatch(onSellOrderUpdate({ payload: packageOrder({ order }) }))
  if (mode === 'bid') return store.dispatch(onBuyOrderUpdate({ payload: packageOrder({ order }) }))
}

export const processOnMessage = async ({
  rawOnMessage,
  option,
}: {
  rawOnMessage: string,
  option: Option,
}) => {
  const { h: header, d: data } = JSON.parse(rawOnMessage)
  // [channel_id, version, type, request_id (optional)]
  const channelId = header[0]
  const type = header[2]
  if (type === 'subscribed') return
  if (type === 'pong') return
  if (header.length >= 5) {
    if (header[4].startsWith('modify-order')) return
  }
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
    const wsChannelOrder = zipChannelOrderData(data)
    const code = await processOrderChannel({ order: wsChannelOrder, option })
    switch (code) {
    case 'UNMET_STATE_TYPES':
    case 'UNMET_EVENT_TYPES':
      throw new Error(`${code}, Raw onMessage: ${rawOnMessage}`)
    default:
      return code
    }
  }

  const errorMessage = header[4]
  if (type === 'error') {
    const code = processErrorMessage(errorMessage)
    if (code === 'UNMET_ERROR_MESSAGE') {
      throw new Error(`${code} Raw onMessage: ${rawOnMessage}`)
    }
    if (code === 'INVALID_PAYLOAD') {
      throw new Error(`${code} Raw onMessage: ${rawOnMessage}`)
    }
    return code
  }
  throw new Error(`Unknown ws message, Raw onMessage: ${rawOnMessage}`)
}
/**
 * Process data from channelId: order
 */
export const processOrderChannel = async ({
  order,
  option,
}: {
  order: WsChannelOrder,
  option: Option,
}) => {
  const { event, id, state }: { event: WsEvent, id: string, state: WsState } = order

  if (id !== option.sellOrderId && id !== option.buyOrderId) return 'IRRELEVANT_ORDER'
  dispatchOrder({ order: order, mode: option.mode.toLowerCase() })

  const stateTypes: Array<WsState> = ['open', 'filled', 'cancelled', 'partially_filled']

  if (!stateTypes.includes(state)) {
    return 'UNMET_STATE_TYPES'
  }

  const eventTypes: Array<WsEvent> = [
    'modified',
    'opened',
    'executed',
    'cancelled',
    'modify_rejected',
  ]

  if (!eventTypes.includes(event)) {
    return 'UNMET_EVENT_TYPES'
  }

  if (event === 'modify_rejected') {
    const message = `Modify rejected, possibility you don't have enough $$: ${option.mode} ${
      option.symbol
    } ${id}`
    logger.warn(message)
    await sendIfttt({ value1: message, option })
    logger.info('Leaving process now')
    if (option.NODE_ENV !== 'development') process.exit(0)
    return 'MODIFY_REJECTED'
  }
  if (state === 'partially_filled' && event === 'executed') {
    const message = `Your order partially filled: ${option.mode} ${option.symbol} ${id}`
    logger.warn(message)
    await sendIfttt({ value1: message, option })
    return 'PARTIALLY_FILLED'
  }
  if (state === 'partially_filled' && event === 'modified') {
    return 'PARTIALLY_FILLED'
  }

  if (state === 'open' && event === 'modified') return 'MODIFIED'

  if (state === 'filled' && event === 'executed') {
    const message = `Your order full filled: ${option.symbol} ${id}`
    logger.info(message)
    await sendIfttt({ value1: message, option })
    logger.info('Leaving process now')
    if (option.NODE_ENV !== 'development') process.exit(0)
    return 'ORDER_FILLED'
  }
  if (state === 'cancelled' && event === 'cancelled') {
    const message = `Your order Cancelled: ${option.symbol} ${id}`
    logger.info(message)
    logger.info('Leaving process now')
    if (option.NODE_ENV !== 'development') process.exit(0)
    return 'ORDER_CANCELLED'
  }

  throw new Error(`Unexpected/un state/event code, wsOrder: ${JSON.stringify(order)}`)
}

export const processErrorMessage = (errorMessage: string) => {
  if (errorMessage === 'balance_locked') {
    logger.warn('balance_locked')
    return 'BALANCE_LOCKED'
  }
  if (errorMessage === 'invalid_payload') {
    logger.warn('invalid_payload')
    return 'INVALID_PAYLOAD'
  }

  return 'UNMET_ERROR_MESSAGE'
}

export const startSync = (option: Option) => {
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
