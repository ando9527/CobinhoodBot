/**
 * Test any times you want 
 * only like 5 api request in here
 */
'use strict';
import config from 'config'

import bot from 'methods'
import Cobinhood from 'cobinhood-api-node'
import store from 'reducer'
import test from 'ava'
import cmd from 'cmd'
/**
 * Test it with 1 order only
 */

// test.skip('setOrderId', async t => {
//     await bot.setOrderId()
//     t.is(typeof store.getState().orderId === "string", true  )
// })

// test.serial('showSpread', async t => {
//     await cmd.showSpread()
//     t.pass()
// })

test.serial('getOrder', async t => {
    const order = await cmd.getOrder()
    console.log(order)
    t.pass()
})