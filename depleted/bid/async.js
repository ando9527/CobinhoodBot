/**
 * multi api request here
 * you should be careful
 */
import test from 'ava'
import bot from 'bidLib'
import lib from 'lib'
import Cobinhood from 'cobinhood-api-node'
import config from 'config'
import store from 'store'
import utils from 'utils'

const api = Cobinhood({
  apiSecret: config.apiSecret,
})
/**
 * Test it with 1 order only
 */

test.serial('updateData', async t => {
  await lib.updateData()
  const data = ['buyOrder', 'opPrice', 'orderBook']
  data.map(item => {
    t.not(store.getState()[item], null)
  })
})

test.serial('checkEnoughBalance', async t => {
  await bot.checkEnoughBalance({ price: 0.0000001 })
  try {
    await bot.checkEnoughBalance({ price: 999999999999999999999999999999999999999999 })
  } catch (error) {
    t.is(error.message, 'You don\'t have enough $$ to modify this order')
  }
})

test.serial('getAssetBalance', async t => {
  const value = await bot.getAssetBalance({ assetType: 'ETH', includeOrder: true })
  t.is(typeof value, 'number')
  const value2 = await bot.getAssetBalance({ assetType: 'ETH', includeOrder: false })
  t.is(typeof value2, 'number')
})

test.serial('verifyConfig', async t => {
  const ans = await bot.verifyConfig()
  t.is(ans, 'SUCCESS')
})

test.serial('verifyConfigFactory', async t => {
  try {
    lib.verifyConfigFactory({ env: 'ENV_TEST', attr: 'test', requires: [] })
  } catch (error) {
    t.is(error.message, 'Please setup ENV_TEST')
  }
})

test.skip('verifyConfigFactory', async t => {
  try {
    bot.verifyConfigFactory({ env: 'ENV_TEST', attr: 'test', requires: ['aaa', 'bbb'] })
  } catch (error) {
    t.is(error.message, 'ENV_TEST ENV, please use aaa,bbb')
  }
})
