// @flow

import sentry from './sentry'
import winston from './winston'
import store from '../store'
import type { Option } from '../types/option'

class Logger {
  static error = (error: Error, option: Option, addition: ?string = null) => {
    const info = store.getState()
    const extra = {
      store: info,
      buyOrderId: option.buyOrderId,
      sellOrderId: option.sellOrderId,
      symbol: option.symbol,
      mode: option.mode,
      addition,
    }
    winston.error(error.stack)
    winston.error(`Extra Info: ${JSON.stringify(extra)} `)
    sentry.error(error, extra)
  }

  static info = (obj: string) => {
    winston.info(obj)
  }

  static warn = (obj: string) => {
    winston.warn(obj)
  }

  static debug = (obj: string) => {
    winston.debug(obj)
  }
}

const logger = Logger
export default logger
