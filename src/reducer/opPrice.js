

export function opPriceReducer(state = null, action) {
    switch (action.type) {
        case "UPDATE_OP_PRICE":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onOpPriceUpdate = ({payload}) => {
    return { type: "UPDATE_OP_PRICE", payload }
}