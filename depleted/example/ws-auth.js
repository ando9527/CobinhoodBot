import dotenv from 'dotenv'
import config from '../../src/config'
import store from '../../src/store'
import logger from '../../src/utils/winston'
dotenv.load()
const WS = require('ws')
let client = null
let connected = false
let connecting = false
const connect = () => {
  if (connecting || connected) return
  connecting = true
  logger.info('connecting')
  client = new WS('wss://ws.cobinhood.com/v2/ws', [], {
    headers: {
      authorization: process.env.BOT_API_SECRET,
      // "nonce": new Date()*1000000 ,
    },
  })

  client.on('open', function(data) {
    logger.info('WS opened')
    connecting = false
    connected = true

    client.send(
      JSON.stringify({
        action: 'subscribe',
        type: 'order',
        trading_pair_id: config.symbol,
      }),
    )

    client.send(
      JSON.stringify({
        action: 'subscribe',
        type: 'order-book',
        trading_pair_id: config.symbol,
      }),
    )
  })

  client.on('close', function(data) {
    logger.info('WS close')
    if (data) logger.info(JSON.parse(data))
    connecting = false
    connected = false
  })

  client.on('message', function(data) {
    logger.info(`ws message: ${data}`)
  })
}

setInterval(function() {
  if (connected) return
  connect()
}, 3500)

/**
 * require ping every 20 sec or disconnection
 */
setInterval(function() {
  if (!connected) return
  client.send(
    JSON.stringify({
      action: 'ping',
    }),
  )
}, 20000)

/**
 * require ping every 20 sec or disconnection
 */
// setInterval(function() {
//   if (!connected) return
//   const {sellOrder, orderBook} = store.getState()
//   client.send(

//     JSON.stringify({
//       "action": "modify_order",
//       "type": "0",    // Type enum above
//       "order_id": `${config.sellOrderId}`,
//       "price": `${0.0015899}`,
//       "size": `${86.8}`,
//       // "stop_price": "",        // mandatory for stop/stop-limit order
//       // "trailing_distance": "", // mandatory for trailing stop order
//       "id": `modify-order-${config.sellOrderId}`
//     }),
//   )
// }, 5000)

// ​​​​​message data {"h":["","2","error","4005","invalid_payload"],"d":[]}
// ​​​​​message data {"h":["","2","u","0","order_req_id2"],"d":["74dab444-9ba7-4493-9ba7-b6b83ac7cada","1527805453398","","ABT-ETH","pending_modification","","ask","0.0015897","0","149.25","0"]}
// ​​​​​message data {"h":["trade.ABT-ETH","2","u"],"d":[["64d8517a-d65d-48fa-aad9-9b6664923523","1527805833568","ask","0.0015897","55.355"]]}
// ​​​​​message data {"h":["","2","u","0","order_req_id2"],"d":["74dab444-9ba7-4493-9ba7-b6b83ac7cada","1527805453398","","ABT-ETH","pending_modification","","ask","0.0015898","0.0015897","149.25","55.355"]}
// ​​​​​message data {"h":["","2","u","0","mmmmmmmm"],"d":["74dab444-9ba7-4493-9ba7-b6b83ac7cada","1527805453398","","ABT-ETH","pending_modification","","ask","0.0015897","0.0015897","86.9","55.355"]}
