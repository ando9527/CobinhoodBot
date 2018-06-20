import config from '../../src/config'
import store from '../../src/store'
import logger from '../../src/utils/winston'
const WS = require('ws')
let client = null
let connected = false
let connecting = false

const connect = () => {
  if (connecting || connected) return
  connecting = true
  logger.info('connecting')
  client = new WS('wss://ws.cobinhood.com/v2/ws')

  client.on('open', function(data) {
    logger.info('WS opened')
    connecting = false
    connected = true

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
    const { h: header, d: orderBook } = JSON.parse(data)
    const status = header[2]
    if (status === 'error') throw new Error(`public ws error:${data}`)
    logger.info(data)
  })
}

// setInterval(function() {
//   if (connected) return
//   connect()
// }, 3500)

// /**
//  * require ping every 20 sec or disconnection
//  */
// setInterval(function() {
//   if (!connected) return
//   client.send(
//     JSON.stringify({
//       "action":"ping"
//     }),
//   )
// }, 20000)

// try {
//   connect()
// } catch (error) {
//   logger.info('got it============');
//   logger.info(error);

// }

const test = () => {
  return new Promise((res, rej) => {
    setInterval(() => {
      logger.info('yo')
      // rej('errrrrrrrrrrr')
    }, 2000)
    res()
  })
}

const run = async () => {
  try {
    await test()
  } catch (e) {
    throw e
  }

  try {
    logger.info('second')
  } catch (error) {}
}

run().catch(err => {
  logger.info('got itttttttttttttt')

  logger.info(err)
  process.exit(1)
})
