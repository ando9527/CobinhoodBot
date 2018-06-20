// @flow
require('dotenv').load()
import winston from 'winston'
import moment from 'moment-timezone'

const env = process.env.NODE_ENV || 'development'
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format

const appendTimestamp = format(info => {
  info.timestamp = moment()
    .tz('Asia/Taipei')
    .format('YYYY-MM-DD HH:mm:ss.SSSS')
  return info
})

const appendSentry = format(info => {})

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`
})

const winstonLogger = createLogger({
  format: combine(winston.format.colorize(), appendTimestamp(), myFormat),
  transports: [new transports.Console()],
})
winstonLogger.level = env === 'development' ? 'debug' : 'info'
export default winstonLogger
