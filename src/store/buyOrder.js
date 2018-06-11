export function buyOrderReducer(state = null, action) {
  switch (action.type) {
    case 'UPDATE_BUY_ORDER': {
      console.log(JSON.stringify(action.payload));
      
      return action.payload
    }
    default:
      return state
  }
}

export const onBuyOrderUpdate = ({ payload }) => {
  return { type: 'UPDATE_BUY_ORDER', payload }
}
