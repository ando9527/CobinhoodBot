// @flow
const Raven = require('raven')
const git = require('git-rev-sync')
import store from '../store'
const dsn = process.env.SENTRY_DSN || 'https://1cb22698d3764fdfbc0377e02e822b66@sentry.io/1229216'
const sentry = Raven.config(process.env.NODE_ENV === 'production' && dsn, {
  release: git.long(),
}).install(function(err, initialErr, eventId) {
  console.error(err)
  console.log('Leaving process now..')
  process.exit(1)
})

/**
 * logger.record('balanced not enough', {tags:{reject: 'balanced not enough'}})
 * logger.error(error, {extra: { foo: { bar: "baz" }}})
 * logger.error(error, {user:{name: 'Ando'}})
 */

export default sentry
