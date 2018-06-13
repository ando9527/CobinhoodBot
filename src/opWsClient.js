// @flow
/**
 * It's a websocket client.
 * Provide the average price of crypto currency from CoinGecko website.
 */
import logger from './utils/winston'
import Websocket from 'ws'
import { haltProcess } from './utils/utils'
import store from './store'
import { onOpPriceUpdate } from './actions/opPrice'
import config from './config'

let client = null
let connected = false
let connecting = false

const connect = () => {
  if (connecting || connected) return
  connecting = true
  logger.info(`[Websocket][Crypto OP] WS connecting to ${config.BOT_OP_WS_URL}`)
  client = new Websocket(config.BOT_OP_WS_URL)
  client.on('open', function(data) {
    logger.info('[Websocket][Crypto OP] WS opened')
    connecting = false
    connected = true

    const add = {
      action: 'subscribe',
      symbol: config.productType.toLowerCase(),
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
        receivingData({ data })
      }
    } catch (error) {
      logger.error(`JSON parse failed ${error}`)
      logger.error(`Original message: ${message}`)
      return
    }
  })
  client.addEventListener('error', err => {
    connecting = false
    connected = false
    logger.warn(`[Websocket][Crypto OP] Error event listener ${err.message}`)
  })
}

const receivingData = ({ data }) => {
  const { symbol, eth, btc, usd } = data
  if (symbol !== config.productType.toLowerCase()) return
  if (config.assetType.toLowerCase() === 'eth')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(eth) } }))
  if (config.assetType.toLowerCase() === 'btc')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(btc) } }))
  if (config.assetType.toLowerCase() === 'usd')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(usd) } }))
  if (config.assetType.toLowerCase() === 'usdt')
    return store.dispatch(onOpPriceUpdate({ payload: { price: parseFloat(usd) } }))
}

export const opAgentRun = () => {
  setInterval(function() {
    try {
      if (connected) return
      connect()
    } catch (error) {
      haltProcess(error)
    }
  }, 3500)

  /**
   * require ping every 20 sec or disconnection
   */
  setInterval(() => {
    try {
      if (!connected) return
      if (client === null) return
      client.send(
        JSON.stringify({
          action: 'ping',
        }),
      )
    } catch (e) {
      haltProcess(e)
    }
  }, 20000)
}
