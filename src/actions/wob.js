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
    console.log('public ws connecting')
    client = new WS('wss://ws.cobinhood.com/v2/ws')
  
    client.on('open', function(data) {
      console.log('public ws opened')
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
      console.log('public ws close')
      if (data) console.log(JSON.parse(data))
      connecting = false
      connected = false
    })
  
    client.on('message', function(data) {
      const { h: header, d: orderBook } = JSON.parse(data)
      const status = header[2]
      if (status === 's') store.dispatch(setWOB({ payload: zipOrderBook(orderBook) }))
      if (status === 'u') store.dispatch(updateWOB({ payload: zipOrderBook(orderBook) }))
      
      if(status==="error") rej(`public ws error:${data}`)
    })
  })
  
}

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


