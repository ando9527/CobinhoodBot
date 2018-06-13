// @flow
import config from './config'
import * as bidMethods from './bid'
import * as askMethods from './ask'

let methods

if (config.mode === 'BID') {
  methods = bidMethods
}

if (config.mode === 'ASK') {
  methods = askMethods
}

if (!methods) throw new Error('ENV BOT_MODE not set correctly.')

export default methods
