

export function sellOrderReducer(state = null, action) {
    switch (action.type) {
        case "UPDATE_SELL_ORDER":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onSellOrderUpdate = ({payload}) => {
    return { type: "UPDATE_SELL_ORDER", payload }
}

