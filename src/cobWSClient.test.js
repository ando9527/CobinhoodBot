var assert = require('assert')
require('dotenv').load()
import {
  processOrderMessage,
  processOnMessage,
  processErrorMessage,
  dispatchOrder,
  zipOrderStateMessage,
} from './cobWsClient'
import store from './store'
import { setOrderBook } from './actions/orderBook'
// import config from './config';
let initialEnv = null

describe('processOrderMessage', function() {
  beforeEach(function(done) {
    // const initial = process.env
    // delete process.env.NODE_ENV;
    // process.env.BOT_SELL_ORDER_ID=`45df1042-74ad-4076-b381-8d016a78e5e8`
    const message =
      '{"h":["order","2","u","0"],"d":["45df1042-74ad-4076-b381-8d016a78e5e8","1528783171573","","ABT-ETH","partially_filled","executed","ask","0.0012799","0.0012799","326","77.261"]}'
    const data = [
      '45df1042-74ad-4076-b381-8d016a78e5e8',
      '1528783171573',
      '',
      'ABT-ETH',
      'partially_filled',
      'executed',
      'ask',
      '0.0012799',
      '0.0012799',
      '326',
      '77.261',
    ]
    store.dispatch(setOrderBook({ payload: { bids: [], asks: [] } }))
    const order = zipOrderStateMessage(data)
    dispatchOrder({ order, mode: 'ask' })
    done()
  })

  it('BALANCE_LOCKED', function() {
    const rawOnMessage =
      '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
    const result = processOnMessage(rawOnMessage)
    assert.equal('BALANCE_LOCKED', result)
  })
  it('ORDER_BOOK_SNAP', function() {
    const rawOnMessage =
      '{"h":["order-book.ABT-ETH.1E-7","2","s"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}'
    const result = processOnMessage(rawOnMessage)
    assert.equal('ORDER_BOOK_SNAP', result)
  })
  it('ORDER_BOOK_UPDATE', function() {
    const rawOnMessage =
      '{"h":["order-book.ABT-ETH.1E-7","2","u"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}'
    const result = processOnMessage(rawOnMessage)
    assert.equal('ORDER_BOOK_UPDATE', result)
  })
  it('MODIFY_REJECTED', function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}'
    const result = processOnMessage(rawOnMessage)
    assert.equal('MODIFY_REJECTED', result)
  })
})

describe('processErrorMessage', () => {
  it('BALANCE_LOCKED', function() {
    let rawOnMessage = '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
    let errorMessage = 'balance_locked'
    const result = processErrorMessage({ errorMessage, rawOnMessage })
    assert.equal('BALANCE_LOCKED', result)
  })
})
