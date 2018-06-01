import dotenv from 'dotenv'
import config from '../config'
import store from '../reducer'
import { onSellOrderUpdate } from '../reducer/sellOrder';
dotenv.load()
const WS = require('ws')
let client = null
let connected = false
let connecting = false

/**
 * set wsOrderBook store
 */
export const setWOB = ({ payload }) => {
  return { type: 'SET_WOB', payload }
}

export const updateWOB = ({ payload }) => {
  return { type: 'UPDATE_WOB', payload }
}

const connect = () => {
  return new Promise((res,rej)=>{
    if (connecting || connected) res()
    connecting = true
    console.log('WS connecting')
    client = new WS('wss://ws.cobinhood.com/v2/ws', [], {
      headers: {
        'authorization': process.env.BOT_API_SECRET,
        // "nonce": new Date()*1000000 ,
      },
    })
  
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
      client.send(
        JSON.stringify({
          action: 'subscribe',
          type: 'order',
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
      const { h: header, d: dataPayload } = JSON.parse(data)
      const status = header[2]
      const type = header[0]
      console.log(data);
      
      if (status === 's') store.dispatch(setWOB({ payload: zipOrderBook(dataPayload) }))
      if (status === 'u' && type.startsWith('order-book')) store.dispatch(updateWOB({ payload: zipOrderBook(dataPayload) }))
      if (status === 'u' && type.endsWith('order')) {
        const order =  zipOrder(dataPayload)
        
        const {event, id} = order
        if (id===config.sellOrderId){
          if (event!=="modified" || event!=="opened") rej(`this order might be done ${data}`)
          store.dispatch(onSellOrderUpdate({payload:order}))
        }
      }
        
      if(status==="error") rej(`WS error:${data}`)
    })
    res('SUCCESS')
  })
  
}
// ​​​​​ws message: {"h":["order-book.ABT-ETH.1E-7","2","u"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}​​​​​

export const startSync = () => {
  return new Promise((res,rej)=>{
    setInterval(async()=> {
      if (connected) return
      try {
        await connect()
        
      } catch (error) {
        rej(error)
      }
      
    }, 3500)
  
    /**
     * require ping every 20 sec or disconnection
     */
    setInterval(()=> {
      if (!connected) return
      client.send(
        JSON.stringify({
          action: 'ping',
        }),
      )
    }, 20000)
    res('SUCCESS')
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

export const zipOrder = (order) => {
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
  
  return Object.assign({},{id, timestamp, trading_pair_id, state, event, side, price, eq_price, size, filled})
}


export const wsModifyOrder = async({price, order}) => {
  if (!connected) throw new Error("WS disconnet, unable to modify order")
  client.send(
    JSON.stringify({
      "action": "modify_order",
      "type": "0",    // Type enum above
      "order_id": `${order.id}`,
      "price": `${price}`,
      "size": `${order.size}`,
      // "stop_price": "",        // mandatory for stop/stop-limit order
      // "trailing_distance": "", // mandatory for trailing stop order
      "id": `modify-order-${order.sellOrderId}`
    }),
  )
}
