import dotenv from 'dotenv'
import config from '../config'
import store from '../reducer'
dotenv.load()
const WS = require('ws')
let client = null
let connected = false
let connecting = false

/**
 * set wsOrderBook store 
 */
export const setWOB = ({payload}) => {
  return { type: "SET_WOB", payload }
}



const connect = () => {
  if (connecting || connected) return
  connecting = true
  console.log('connecting')
  // client = new WS('wss://ws.cobinhood.com/v2/ws', [], {
  //   headers: {
  //     'authorization': process.env.BOT_API_SECRET,
  //     // "nonce": new Date()*1000000 ,
  //   },
  // })
  client = new WS('wss://ws.cobinhood.com/v2/ws')

  client.on('open', function(data) {
    console.log('WS opened')
    connecting = false
    connected = true

    client.send(
      JSON.stringify({
"action":"subscribe","type":"order-book","trading_pair_id":config.symbol
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
    // console.log(data)
    const {h:header, d:orderBook} = JSON.parse(data)
    const status = header[2]
    if (status === 's') store.dispatch(updateWOB({payload:zipOrderBook(orderBook)}));
    // if (status === "u") console.log(data);
    
    
    
  })
}

export const startSync=()=>{
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

  setInterval(async() => {
    console.log(store.getState().wob);   
  },3000)
}

const zipOrderBook=(orderBook)=>{
  const newAsk = orderBook.asks.map(a=>Object.assign({},{price:parseFloat(a[0]), count: parseFloat(a[1]), size: parseFloat(a[2])}))
  const newBid = orderBook.asks.map(a=>Object.assign({},{price:parseFloat(a[0]), count: parseFloat(a[1]), size: parseFloat(a[2])}))
  return {bids: newBid, asks: newAsk}
}

startSync()



