import dotenv from 'dotenv'
import config from '../config'
dotenv.load()
const WS = require('ws')
let client = null
let connected = false
let connecting = false

/**
 * update wsOrderBook store 
 */
export const updateWOB = ({payload}) => {
  return { type: "UPDATE_WOB", payload }
}

// "orderBook":{"asks":[{"price":0.0000386,"count":1,"size":2209.96},{"price":0.0000387,"count":1,"size":2700},{"price":0.0000388,"count":1,"size":612},{"price":0.0000394,"count":1,"size":36250},{"price":0.0000403,"count":1,"size":12800},{"price":0.0000409,"count":2,"size":28751},{"price":0.0000411,"count":1,"size":800},{"price":0.0000433,"count":1,"size":1404.01287989},{"price":0.000044,"count":1,"size":600},{"price":0.0000442,"count":1,"size":600},{"price":0.0000447,"count":1,"size":600},{"price":0.000045,"count":2,"size":1200},{"price":0.0000453,"count":2,"size":3003},{"price":0.0000459,"count":1,"size":773.31406181},{"price":0.000046,"count":1,"size":600},{"price":0.0000462,"count":1,"size":8159.0485751},{"price":0.0000463,"count":1,"size":14798.26473208},{"price":0.0000467,"count":1,"size":600},{"price":0.0000469,"count":1,"size":1000},{"price":0.000047,"count":1,"size":1000},{"price":0.0000471,"count":1,"size":30000},{"price":0.0000476,"count":1,"size":51933.90191898},{"price":0.000048,"count":2,"size":12918.74642315},{"price":0.0000487,"count":1,"size":5000},{"price":0.0000493,"count":1,"size":7514.60378506},{"price":0.0000494,"count":1,"size":29471.47094442},{"price":0.0000498,"count":1,"size":10000},{"price":0.0000499,"count":3,"size":5496.0134562},{"price":0.00005,"count":1,"size":10000},{"price":0.0000501,"count":1,"size":600},{"price":0.0000503,"count":3,"size":2616},{"price":0.0000504,"count":3,"size":101044},{"price":0.0000505,"count":2,"size":3009},{"price":0.0000506,"count":1,"size":600},{"price":0.0000507,"count":1,"size":600},{"price":0.000051,"count":1,"size":25000},{"price":0.000052,"count":1,"size":553.88},{"price":0.0000523,"count":1,"size":10000},{"price":0.0000525,"count":1,"size":10000},{"price":0.0000532,"count":1,"size":2148.09523809},{"price":0.0000536,"count":1,"size":20000},{"price":0.000054,"count":1,"size":533},{"price":0.0000549,"count":2,"size":2536.19916506},{"price":0.000055,"count":5,"size":15539},{"price":0.0000551,"count":2,"size":5098},{"price":0.0000557,"count":1,"size":646.8318584},{"price":0.0000575,"count":2,"size":20001},{"price":0.0000588,"count":1,"size":50000},{"price":0.0000589,"count":1,"size":808},{"price":0.000059,"count":2,"size":11340.18518518}],"bids":[{"price":0.0000371,"count":1,"size":3867.43},{"price":0.000037,"count":1,"size":553},{"price":0.0000359,"count":2,"size":13870.9595},{"price":0.0000358,"count":1,"size":1000},{"price":0.0000354,"count":1,"size":553},{"price":0.0000334,"count":1,"size":5000},{"price":0.0000333,"count":1,"size":12000},{"price":0.0000332,"count":1,"size":10000},{"price":0.0000301,"count":1,"size":6000},{"price":0.000029,"count":1,"size":1724.14},{"price":0.0000289,"count":1,"size":5000},{"price":0.0000286,"count":1,"size":7000},{"price":0.0000285,"count":1,"size":10000},{"price":0.0000278,"count":1,"size":627},{"price":0.0000275,"count":1,"size":36363},{"price":0.0000272,"count":1,"size":10000},{"price":0.0000271,"count":1,"size":5000},{"price":0.000027,"count":1,"size":10000},{"price":0.000026,"count":1,"size":10000},{"price":0.000025,"count":1,"size":10000},{"price":0.0000235,"count":1,"size":3500},{"price":0.0000233,"count":1,"size":10000},{"price":0.0000209,"count":1,"size":8182},{"price":0.0000174,"count":1,"size":20873},{"price":0.0000173,"count":1,"size":20000},{"price":0.000016,"count":1,"size":3321},{"price":0.0000151,"count":1,"size":25000},{"price":0.000015,"count":1,"size":6659},{"price":0.0000108,"count":1,"size":12978.7234043},{"price":0.0000103,"count":1,"size":13890.29126568},{"price":0.00001,"count":1,"size":10000},{"price":0.0000067,"count":1,"size":6049.6715694},{"price":0.0000066,"count":1,"size":5093.4880722},{"price":0.0000063,"count":1,"size":22000.00000011},{"price":0.000006,"count":1,"size":1000},{"price":0.0000059,"count":1,"size":92546.10169495},{"price":0.0000058,"count":1,"size":10000},{"price":0.0000025,"count":1,"size":15271.4508},{"price":0.0000024,"count":1,"size":45000},{"price":0.0000022,"count":1,"size":31914.89361737},{"price":0.0000019,"count":1,"size":14065.80521052},{"price":0.0000018,"count":1,"size":37249.99999997},{"price":0.0000017,"count":1,"size":44744.70588236},{"price":3e-7,"count":1,"size":72751.17861668},{"price":2e-7,"count":1,"size":500000},{"price":1e-7,"count":2,"size":418.61080401}]},"opPrice":0.00003421,"sellOrder":null,"orderId":null}


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
    if (status === 's') console.log(zipOrderBook(orderBook));
    
    
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
}

const zipOrderBook=(orderBook)=>{
  const newAsk = orderBook.asks.map(a=>{price:parseFloat(a[0]), count: parseFloat(a[1]), size: parseFloat(a[2])})
  const newBid = orderBook.bids.map(a=>{price:parseFloat(a[0]), count: parseFloat(a[1]), size: parseFloat(a[2])})
  return {bids: newBid, asks: newAsk}
}

startSync()



