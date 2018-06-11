import { createStore, combineReducers } from 'redux'
import {balanceReducer} from './balance'
import {buyOrderReducer} from './buyOrder'
import {opPriceReducer} from './opPrice'
import {sellOrderReducer} from './sellOrder'
import {orderIdReducer} from './orderId'
import { configReducer } from './config';
import {wobReducer} from './wob'

const rootReducer = combineReducers({
    buyOrder: buyOrderReducer,
    balance: balanceReducer,
    orderBook: wobReducer,
    opPrice: opPriceReducer,
    sellOrder: sellOrderReducer,
    orderId: orderIdReducer,
    config: configReducer,
  });
const store = createStore(rootReducer)

export default store

