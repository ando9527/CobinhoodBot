// @flow
import type { OpPrice, OnOpPriceUpdateAction } from "../types/opPrice";
import { UPDATE_OP_PRICE} from "../types/opPrice";
import moment from 'moment-timezone'

export function opPriceReducer(state: OpPrice = {price: 0, lastUpdate: "NONE"}, action: OnOpPriceUpdateAction): OpPrice {
  switch (action.type) {
    case UPDATE_OP_PRICE: {
      const {price} = action.payload
      const lastUpdate = moment().tz("Asia/Taipei").format('YYYY-MM-DD HH:mm:ss.SSSS');
      return Object.assign({}, {price, lastUpdate})
    }
    default:
      return state
  }
}
