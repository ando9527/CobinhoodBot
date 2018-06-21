// @flow
import { register } from 'babel-core'
import polyfill from 'babel-polyfill'
import store from './store'
import { sendIfttt } from './utils/utils'
import logger from './helpers/winston'
import * as axiosConfig from './helpers/axiosConfig'
import { runSellOrder } from './ask'
import { runBuyOrder } from './bid'

// bot.run().catch(async error => {
//   logger.error(error)
// })
export default class Launcher {
  static launch = async (option: any) => {
    if (option.mode.toUpperCase === 'ASK') return runSellOrder(option)
    if (option.mode.toUpperCase === 'BID') return runBuyOrder(option)
  }
}
