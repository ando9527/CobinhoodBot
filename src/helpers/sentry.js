// @flow
const Raven = require('raven')
const git = require('git-rev-sync')
import config from '../config'
import winstonLogger from './winston'
import store from '../store'
const dsn = config.SENTRY_DSN
Raven.config(process.env.NODE_ENV === 'production' && dsn, { release: git.long() }).install()

/**
 * logger.record('balanced not enough', {tags:{reject: 'balanced not enough'}})
 * logger.error(error, {extra: { foo: { bar: "baz" }}})
 * logger.error(error, {user:{name: 'Ando'}})
 */
type AdditionData = {
  user?: { name: string },
  tags?: { [string]: string },
  extra?: any,
  level?: string,
} | null

class Logger {
  info = (obj: any, addition: any = null) => {
    return winstonLogger.info(obj)
  }

  error = (obj: any, addition?: AdditionData) => {
    const record = Object.assign({}, store.getState(), { config: null })
    addition
      ? Raven.captureException(obj, addition, { extra: record, ...addition })
      : Raven.captureException(obj, { extra: record })
    return winstonLogger.error(obj)
  }

  warn = (obj: any) => {
    return winstonLogger.warn(obj)
  }

  debug = (obj: any) => {
    return winstonLogger.debug(obj)
  }

  record = (obj: any, addition?: AdditionData) => {
    addition ? Raven.captureMessage(obj, addition) : Raven.captureException(obj)
    return Raven.captureMessage(obj)
  }

  recordHalt = (obj: any, addition?: AdditionData) => {
    winstonLogger.error(`${obj} ${JSON.stringify(addition)}`)
    const record = Object.assign({}, store.getState(), { config: null })
    addition
      ? Raven.captureMessage(obj, addition, { extra: { record, ...addition } })
      : Raven.captureException(obj, { extra: record })
    return Raven.captureMessage(obj)
  }
}

const logger = new Logger()
export default logger
