// @flow
import type { Option } from '../types/option'
import sentry from './sentry'
import winston from './winston'
import store from '../store'
import { sendIfttt } from '../utils/utils'

class Logger {
  static error = async (error: Error, option: Option, addition: ?string = null) => {
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
    sentry.captureException(error, { extra })
    const ifMessage = `Unexpected crashed, ${error.message}, ${option.symbol} ${option.mode} ${
      option.buyOrderId
    } ${option.sellOrderId}`
    await sendIfttt({
      value1: ifMessage,
      value2: error.stack,
      value3: JSON.stringify(extra),
      option,
    })
    logger.warn('Leaving process now..')
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
    sentry.captureMessage(message, { extra })
  }
}

const logger = Logger
export default logger
