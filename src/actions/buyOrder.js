// @flow
import type { BuyOrder, OnBuyOrderUpdateAction } from '../types/buyOrder'
import { UPDATE_BUY_ORDER } from '../types/buyOrder'

export const onBuyOrderUpdate = ({ payload }: { payload: BuyOrder }): OnBuyOrderUpdateAction => {
  return { type: UPDATE_BUY_ORDER, payload }
}
