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
    sentry.captureException(error, extra)
    process.exit(1)
  }

  static info = (message: string) => {
    winston.info(message)
  }

  static warn = (message: string) => {
    winston.warn(message)
  }

  static debug = (message: string) => {
    winston.debug(message)
  }

  static record = (message: string, option: Option) => {
    const info = store.getState()
    const extra = {
      store: info,
      buyOrderId: option.buyOrderId,
      sellOrderId: option.sellOrderId,
      symbol: option.symbol,
      mode: option.mode,
    }
    winston.warn(`Extra Info: ${JSON.stringify(extra)} `)
    sentry.captureMessage(message, extra)
  }
}

const logger = Logger
export default logger
