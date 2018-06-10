// @flow
import logger from './utils/winston'
import config from './config'
import Websocket from 'ws'
import { haltProcess } from './utils/utils';
import store from './reducer';
import { onOpPriceUpdate } from './actions/opPrice';

let client = null
let connected = false
let connecting = false

const connect = () => {
  if (connecting || connected) return
  connecting = true
  logger.info(`[Websocket] connecting to ${config.BOT_WS_URL}`)
  client = new Websocket(config.BOT_WS_URL)
  client.on('open', function(data) {
    logger.info('[Websocket] CoinGecko WS opened')
    connecting = false
    connected = true

    const add = {
      action: "subscribe",
      symbol: config.productType.toLowerCase(),
    }
    if (client!==null)client.send(JSON.stringify(add))

  })

  client.on('close', function(data) {
    logger.info('[WebSocket] CoinGecko WS close')
    if (data) logger.info(JSON.parse(data))
    connecting = false
    connected = false
  })

  client.on('message', function(message) {
    try {
      logger.debug(`[Websocket] opAgent ws message receiving: ${message}`)
      const {h: header, d: data} = JSON.parse(message)
      if (header[0]==="price"){
        receivingData({data})
      } 
    } catch (error) {
      logger.error(`JSON parse failed ${error}`)
      return 
    }
  })
}

const receivingData = ({data}) => {
  const {symbol, eth, btc, usd} = data
  if (symbol!== config.productType.toLowerCase())return
  if (config.assetType.toLowerCase()==="eth") return store.dispatch(onOpPriceUpdate({payload:{price: parseFloat(eth)}}))
  if (config.assetType.toLowerCase()==="btc") return store.dispatch(onOpPriceUpdate({payload:{price: parseFloat(btc)}}))
  if (config.assetType.toLowerCase()==="usd") return store.dispatch(onOpPriceUpdate({payload:{price: parseFloat(usd)}}))
  if (config.assetType.toLowerCase()==="usdt") return store.dispatch(onOpPriceUpdate({payload:{price: parseFloat(usd)}}))
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
      if (client ===null) return 
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


