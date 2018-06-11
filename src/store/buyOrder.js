// @flow
import type { BuyOrder, OnBuyOrderUpdateAction } from "../types/buyOrder";
import { UPDATE_BUY_ORDER,  } from "../types/buyOrder";


export function buyOrderReducer(state: BuyOrder= null, action: OnBuyOrderUpdateAction ):BuyOrder {
  switch (action.type) {
    case UPDATE_BUY_ORDER: {
      return action.payload
    }
    default:
      return state
  }
}


