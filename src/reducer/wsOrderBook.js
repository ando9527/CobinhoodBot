

export function wsOrderBookReducer(state = null, action) {
  switch (action.type) {
      case "UPDATE_ORDER_BOOK":
      {
          return action.payload
      }    
      default:
      return state
  }
}


