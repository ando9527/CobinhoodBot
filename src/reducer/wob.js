

export function wobReducer(state = null, action) {
  switch (action.type) {
      case "SET_WOB":
      {
          return action.payload
      }    
      default:
      return state
  }
}


