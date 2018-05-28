import store from '../reducer'
import initial from './initial'
import * as axiosConfig from './axiosConfig'

if (!store.getState().config) initial()
const config = store.getState().config 
export default config