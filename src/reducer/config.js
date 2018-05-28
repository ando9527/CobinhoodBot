export function configReducer(state = null, action) {
    switch (action.type) {
        case "INSERT_CONFIG":
        {
            return action.payload
        }    
        default:
        return state
    }
  }

export const onConfigInsert = ({payload}) => {
    return { type: "INSERT_CONFIG", payload }
}