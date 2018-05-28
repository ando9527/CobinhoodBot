

export function orderBookReducer(state = null, action) {
    switch (action.type) {
        case "UPDATE_ORDER_BOOK":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onOrderBookUpdate = ({payload}) => {
    return { type: "UPDATE_ORDER_BOOK", payload }
}