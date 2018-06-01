import {  sortOrder } from "../utils/utils";

export function wobReducer(state = null, action) {
  switch (action.type) {
    case 'SET_WOB': {
      
      
      return action.payload
    }
    case 'UPDATE_WOB': {
      return wobMaker({state, orderBook: action.payload})
    }
    default:
      return state
  }
}

export const ordersMaker=({orders, uOrders})=>{
  let newOrders = []
  let flag = null
  if (uOrders.length===0)return orders

  for (let item of orders){
    for (let j of uOrders){
      if(item.price===j.price){
        const count = item.count+j.count
        const size = item.size+j.size
        if(count!==0) newOrders.push(Object.assign({},{price:item.price, count, size}))
        flag = "DONE"
      }else{
        newOrders.push(item)
      }
    }
  }  
  if (flag===null) newOrders.push(uOrders[0])
  return newOrders
}

export const wobMaker=({state, orderBook})=>{ 
  const {asks, bids} = state
  const {asks: uasks, bids: ubids} = orderBook
  const newAsks = ordersMaker({orders:asks, uOrders: uasks})
  newAsks.sort(sortOrder)
  const newBids = ordersMaker({orders: bids, uOrders:ubids})  
  newBids.sort(sortOrder).reverse()
  return Object.assign({}, {asks:newAsks, bids: newBids})

}