// @flow
import { register } from 'babel-core'
import polyfill from 'babel-polyfill'
import type { Option } from './types/option'
import store from './store'
import { sendIfttt } from './utils/utils'
import logger from './helpers/logger'
import * as axiosConfig from './helpers/axiosConfig'
import { runSellOrder } from './ask'
import { runBuyOrder } from './bid'
import packageJson from '../package.json'

export default class Launcher {
  static launch = async (option: Option) => {
    logger.info(`Version ${packageJson.version}`)
    logger.info(`NODE_ENV: ${option.NODE_ENV}`)
    if (option.mode.toUpperCase() === 'ASK') return await runSellOrder(option)
    if (option.mode.toUpperCase() === 'BID') return await runBuyOrder(option)
  }
}
