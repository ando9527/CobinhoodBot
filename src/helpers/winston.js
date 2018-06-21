// @flow
import Winston from 'winston'
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

const winston = createLogger({
  format: combine(Winston.format.colorize(), appendTimestamp(), myFormat),
  transports: [new transports.Console()],
})
winston.level = env === 'development' ? 'debug' : 'info'
export default winston
