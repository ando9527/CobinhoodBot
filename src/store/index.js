// @flow
import { createStore, combineReducers } from 'redux'
import {buyOrderReducer} from './buyOrder'
import {opPriceReducer} from './opPrice'
import {sellOrderReducer} from './sellOrder'
import {orderBookReducer} from './orderBook'

const rootReducer = combineReducers({
    buyOrder: buyOrderReducer,
    orderBook: orderBookReducer,
    opPrice: opPriceReducer,
    sellOrder: sellOrderReducer,
  });
const store = createStore(rootReducer)

export default store

