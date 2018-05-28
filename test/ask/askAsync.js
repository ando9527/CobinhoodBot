/**
 * multi api request here
 * you should be careful 
 */
import test from 'ava'
import bot from 'askLib'
import Cobinhood from 'cobinhood-api-node'
import config from 'config'
import store from 'reducer'
import utils from 'utils'
import lib from 'lib'

const api = Cobinhood({
    apiSecret: config.apiSecret,
})

test.serial('updateData', async t => {
    await lib.updateData()
    const data = ['sellOrder', 'orderBook']
    data.map(item=>{
        t.not(store.getState()[item], null)
    })
})


test.serial('verifyConfig', async t => {
    const ans = await bot.verifyConfig()
    t.is(ans, 'SUCCESS')
})

test.serial('lib.verifyConfigFactory', async t => {
    try {
      lib.verifyConfigFactory({env:"ENV_TEST", attr:'test', requires:[]})
    } catch (error) { 
      t.is(error.message, "Please setup ENV_TEST")
    }
})

test.skip('lib.verifyConfigFactory', async t => {
    try {
      lib.verifyConfigFactory({env:"ENV_TEST", attr:'test', requires:["aaa","bbb"]})
    } catch (error) { 
      t.is(error.message, `ENV_TEST ENV, please use aaa,bbb`)
    }
})