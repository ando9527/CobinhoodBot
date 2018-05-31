import dotenv from 'dotenv'
import config from '../../src/config'
dotenv.load()
const WS = require('ws')
let client = null
let connected = false
let connecting = false

const connect = () => {
  if (connecting || connected) return
  connecting = true
  console.log('connecting')
  client = new WS('wss://ws.cobinhood.com/v2/ws')

  client.on('open', function(data) {
    console.log('WS opened')
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
    console.log('WS close')
    if (data) console.log(JSON.parse(data))
    connecting = false
    connected = false
  })

  client.on('message', function(data) {
    console.log('message data', data)
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
      "action":"ping"
    }),
  )
}, 20000)