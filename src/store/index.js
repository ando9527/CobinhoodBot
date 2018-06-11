import { createStore, combineReducers } from 'redux'
import {buyOrderReducer} from './buyOrder'
import {opPriceReducer} from './opPrice'
import {sellOrderReducer} from './sellOrder'
import {wobReducer} from './wob'

const rootReducer = combineReducers({
    buyOrder: buyOrderReducer,
    orderBook: wobReducer,
    opPrice: opPriceReducer,
    sellOrder: sellOrderReducer,
  });
const store = createStore(rootReducer)

export default store

