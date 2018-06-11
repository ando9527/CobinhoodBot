

export function orderIdReducer(state = null, action) {
    switch (action.type) {
        case "UPDATE_ORDER_ID":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onOrderIdUpdate = ({payload}) => {
    return { type: "UPDATE_ORDER_ID", payload }
}