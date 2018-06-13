// @flow
import dotenv from 'dotenv'
import winston from 'winston'
import moment from 'moment-timezone'
dotenv.load()
const env = process.env.NODE_ENV || 'development'
const tsFormat = () =>
  moment()
    .tz('Asia/Taipei')
    .format('YYYY-MM-DD HH:mm:ss')
const logger = new winston.Logger({
  transports: [
    // colorize the output to the console
    new winston.transports.Console({
      timestamp: tsFormat,
      colorize: true,
    }),
  ],
})
logger.level = env === 'development' ? 'debug' : 'info'
export default logger
