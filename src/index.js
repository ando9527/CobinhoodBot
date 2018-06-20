// @flow
import { register } from 'babel-core'
import polyfill from 'babel-polyfill'
import bot from './methods'
import store from './store'
import { sendIfttt } from './utils/utils'
import config from './config'
import logger from './helpers/sentry'

bot.run().catch(async error => {
  logger.error(error)
})
