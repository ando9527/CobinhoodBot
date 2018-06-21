// @flow
/**
 * It's a websocket client.
 * Provide the average price of crypto currency from CoinGecko website.
 */
import logger from './helpers/logger'
import Websocket from 'ws'
import store from './store'
import { onOpPriceUpdate } from './actions/opPrice'
import type { Option } from './types/option'

let client = null
let connected = false
let connecting = false

const connect = option => {
  if (connecting || connected) return
  connecting = true
  logger.info(`[Websocket][Crypto OP] WS connecting to ${option.BOT_OP_WS_URL}`)
  client = new Websocket(option.BOT_OP_WS_URL)
  client.on('open', function(data) {
    logger.info('[Websocket][Crypto OP] WS opened')
    connecting = false
    connected = true

    const add = {
      action: 'subscribe',
      symbol: option.productType.toLowerCase(),
    }
    if (client !== null) client.send(JSON.stringify(add))
  })

  client.on('close', function(data) {
    logger.warn('[Websocket][Crypto OP] WS close')
    if (data) logger.warn(`[Websocket][Crypto OP] on close message ${JSON.parse(data)}`)
    connecting = false
    connected = false
  })

  client.on('message', function(message) {
    try {
      logger.debug(`[Websocket][Crypto OP] WS message receiving: ${message}`)
      const { h: header, d: data } = JSON.parse(message)
      if (header[0] === 'price' && data !== null) {
        receivingData({ data, option })
      }
    } catch (error) {
      logger.error(error, option, `rawOnMessage: ${message}`)
      return
    }
  })
  client.addEventListener('error', err => {
    connecting = false
    connected = false
    logger.record(`[Websocket][Crypto OP] Error event listener ${err.message}`, option)
  })
}

const receivingData = ({ data, option }) => {
  const { symbol, eth, btc, usd } = data
  if (symbol !== option.productType.toLowerCase()) return
  if (option.assetType.toLowerCase() === 'eth')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(eth) } }))
  if (option.assetType.toLowerCase() === 'btc')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(btc) } }))
  if (option.assetType.toLowerCase() === 'usd')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(usd) } }))
  if (option.assetType.toLowerCase() === 'usdt')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(usd) } }))
}

export const opAgentRun = (option: Option) => {
  setInterval(function() {
    try {
      if (connected) return
      connect(option)
    } catch (error) {
      logger.error(error, option)
    }
  }, 3500)

  /**
   * require ping every 20 sec or disconnection
   */
  // setInterval(() => {
  //   try {
  //     if (!connected) return
  //     if (client === null) return
  //     client.send(
  //       JSON.stringify({
  //         action: 'ping',
  //       }),
  //     )
  //   } catch (e) {
  //     haltProcess(e)
  //   }
  // }, 20000)
}
