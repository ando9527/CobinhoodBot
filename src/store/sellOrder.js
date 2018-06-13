// @flow
import type { SellOrder, OnSellOrderUpdateAction } from '../types/sellOrder'
import { UPDATE_SELL_ORDER } from '../types/sellOrder'

export function sellOrderReducer(
  state: SellOrder = null,
  action: OnSellOrderUpdateAction,
): SellOrder {
  switch (action.type) {
  case UPDATE_SELL_ORDER: {
    return action.payload
  }
  default:
    return state
  }
}
