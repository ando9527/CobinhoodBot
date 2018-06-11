// @flow
import type { OpPrice, OnOpPriceUpdateAction } from "../types/opPrice";
import { UPDATE_OP_PRICE} from "../types/opPrice";
import moment from 'moment-timezone'
import logger from "../utils/winston";

export function opPriceReducer(state: OpPrice = {price: 0, lastUpdate: "NONE"}, action: OnOpPriceUpdateAction): OpPrice {
  switch (action.type) {
    case UPDATE_OP_PRICE: {
      logger.debug(`[Redux][opPriceReducer] UPDATE_OP_PRICE-payload: ${JSON.stringify(action.payload)}`)
      const {price} = action.payload
      const lastUpdate = moment().tz("Asia/Taipei").format('YYYY-MM-DD HH:mm:ss');
      return Object.assign({}, {price, lastUpdate})
    }
    default:
      return state
  }
}
