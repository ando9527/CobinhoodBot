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

export const wobMaker=({state, orderBook})=>{
  // console.log(state);
  // console.log(orderBook);
  
  
  const {asks, bids} = state
  const {asks: uasks, bids: ubids} = orderBook
  let newAsks = []
  if (uasks.length===0) newAsks = asks
  for (let item of asks){
    for (let j of uasks){
      if(item.price===j.price){
        const count = item.count+j.count
        const size = item.size+j.size
        if(count!==0) newAsks.push(Object.assign({},{price:item.price, count, size}))
      }else{
        newAsks.push(item)
      }
    }
  }     
  let newBids = []
  if (ubids.length===0) newBids = bids
  for (let item of bids){
    for (let j of ubids){
      if(item.price===j.price){
        const count = item.count+j.count
        const size = item.size+j.size
        if(count!==0) newBids.push(Object.assign({},{price: item.price, count, size}))
      }else{
        
        newBids.push(item)
      }
    }
  }  
  
  return Object.assign({}, {asks:newAsks, bids: newBids})

}