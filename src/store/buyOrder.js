

export function buyOrderReducer(state = null, action) {
    switch (action.type) {
        case "UPDATE_BUY_ORDER":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onBuyOrderUpdate = ({payload}) => {
    return { type: "UPDATE_BUY_ORDER", payload }
}