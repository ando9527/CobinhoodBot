// @flow
import type { SellOrder, OnSellOrderUpdateAction } from '../types/sellOrder'
import { UPDATE_SELL_ORDER } from '../types/sellOrder'

export const onSellOrderUpdate = ({ payload }: { payload: SellOrder }): OnSellOrderUpdateAction => {
  return { type: UPDATE_SELL_ORDER, payload }
}
