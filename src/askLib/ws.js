// import dotenv from 'dotenv'
// import config from '../config'
// import store from '../reducer'
// dotenv.load()
// const WS = require('ws')
// let client = null
// let connected = false
// let connecting = false

// const connect = () => {
//   return new Promise((res,rej)=>{
//     if (connecting || connected) res()
//     connecting = true
//     console.log('private ws connecting')
//     client = new WS('wss://ws.cobinhood.com/v2/ws', [], {
//       headers: {
//         'authorization': process.env.BOT_API_SECRET,
//         // "nonce": new Date()*1000000 ,
//       },
//     })
  
//     client.on('open', function(data) {
//       console.log('private ws opened')
//       connecting = false
//       connected = true
  
//       client.send(
//         JSON.stringify({
//           action: 'subscribe',
//           type: 'trade',
//           trading_pair_id: config.symbol,
//         }),
//       )
//     })
  
//     client.on('close', function(data) {
//       console.log('private ws  close')
//       if (data) console.log(JSON.parse(data))
//       connecting = false
//       connected = false
//     })
  
//     client.on('message', function(data) {
//       console.log(`private ws message: ${data}`)
//       const {h:header} = JSON.parse(data)
//       const status = header[2]
//       if(status==="error") rej(`private ws error:${data}`)
//     })
//   })
  
// }

// export const startPrivateWS = async() => {
//     return new Promise(async(res,rej)=>{
//       setInterval(function() {
//         if (connected) return
//         try {
//           await connect()
//         } catch (error) {
//           rej(error)
//         }
        
//       }, 3500)

//       setInterval(function() {
//         if (!connected) return
//         client.send(
//           JSON.stringify({
//             "action":"ping"
//           }),
//         )
//       }, 20000)
//     })
// }


// export const wsModifyOrder = async({price, order}) => {
//   if (!connected) throw new Error("private ws disconnet, unable to modify order")
//   client.send(
//     JSON.stringify({
//       "action": "modify_order",
//       "type": "0",    // Type enum above
//       "order_id": `${order.id}`,
//       "price": `${price}`,
//       "size": `${order.size}`,
//       // "stop_price": "",        // mandatory for stop/stop-limit order
//       // "trailing_distance": "", // mandatory for trailing stop order
//       "id": `modify-order-${order.sellOrderId}`
//     }),
//   )
// }




// // ​​​​​message data {"h":["","2","error","4005","invalid_payload"],"d":[]}​​​​​
// // ​​​​​message data {"h":["","2","u","0","order_req_id2"],"d":["74dab444-9ba7-4493-9ba7-b6b83ac7cada","1527805453398","","ABT-ETH","pending_modification","","ask","0.0015897","0","149.25","0"]}​​​​​
// // ​​​​​message data {"h":["trade.ABT-ETH","2","u"],"d":[["64d8517a-d65d-48fa-aad9-9b6664923523","1527805833568","ask","0.0015897","55.355"]]}​​​​​
// // ​​​​​message data {"h":["","2","u","0","order_req_id2"],"d":["74dab444-9ba7-4493-9ba7-b6b83ac7cada","1527805453398","","ABT-ETH","pending_modification","","ask","0.0015898","0.0015897","149.25","55.355"]}​​​​​
// // ​​​​​message data {"h":["","2","u","0","mmmmmmmm"],"d":["74dab444-9ba7-4493-9ba7-b6b83ac7cada","1527805453398","","ABT-ETH","pending_modification","","ask","0.0015897","0.0015897","86.9","55.355"]}​​​​​