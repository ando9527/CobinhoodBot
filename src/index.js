// @flow
import { register } from 'babel-core'
import polyfill from 'babel-polyfill'
import bot from './methods'
import store from './store'
import { sendIfttt } from './utils/utils'
import config from './config'
import logger from './utils/winston'

bot.run().catch(async error => {
  logger.error(`Global Error ${error}`)
  logger.error(store.getState())
  const record = Object.assign({}, store.getState(), { config: null })
  await sendIfttt(`${config.mode} - ${config.symbol} - ${error.message}`, JSON.stringify(record))
  process.exit(1)
})
