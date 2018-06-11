export function balanceReducer(state = null, action) {
    switch (action.type) {
        case "UPDATE_BALANCE":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onBalanceUpdate = ({payload}) => {
    return { type: "UPDATE_BALANCE", payload }
}