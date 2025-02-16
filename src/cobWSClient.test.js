var assert = require('assert')
require('dotenv').load()
import {
  processOrderChannel,
  processOnMessage,
  processErrorMessage,
  dispatchOrder,
  zipChannelOrderData,
} from './cobWsClient'
import store from './store'
import { setOrderBook } from './actions/orderBook'
let initialEnv = null
const option = {
  NODE_ENV: 'development',
  increment: 1e-7,
  decrement: 1e-7,
  apiSecret: '50',
  watchOnly: true,
  mode: 'ASK',
  assetType: 'ETH',
  productType: 'LYM',
  symbol: 'LYM-ETH',
  quantityComparePercentage: 20,
  profitLimitPercentage: 10,
  iftttEnable: true,
  iftttEvent: 'cbb',
  iftttKey: 'bLOK',
  buyOrderId: '0e721f13-7a98-49d0-a2bc-d8e1ae1ae218',
  totalPriceLimit: 0.45,
  opPercentage: -10,
  BOT_OP_API_URL: 'https://crypto.nctu.me/api/cg',
  BOT_OP_WS_URL: 'wss://crypto.nctu.me/ws',
  BOT_CHECK_INTERVAL: 5,
  sellOrderId: '6136e360-da2c-4f7e-bcc9-d938d878a6c0',
  productCost: 1e25,
}
describe('processOrderChannel', async function() {
  beforeEach(async function(done) {
    done()
  })
  it('IRRELEVANT_ORDER', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["different-order9-d938d878a6c0s","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('IRRELEVANT_ORDER', result)
  })
  it('UNMET_STATE_TYPES', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","triggered","trigger_rejected","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('UNMET_STATE_TYPES', result)
  })

  it('UNMET_EVENT_TYPES', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","trigger_rejected","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('UNMET_EVENT_TYPES', result)
  })

  it('MODIFY_REJECTED', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('MODIFY_REJECTED', result)
  })

  it('PARTIALLY_FILLED', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","partially_filled","executed","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('PARTIALLY_FILLED', result)
  })

  it('ORDER_FILLED', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","filled","executed","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('ORDER_FILLED', result)
  })

  it('ORDER_CANCELLED', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","cancelled","cancelled","bid","0.0000001","0","50","0"]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const order = zipChannelOrderData(data)
    const result = await processOrderChannel({ order, option })
    assert.equal('ORDER_CANCELLED', result)
  })
})

/**
 * Process Error Message
 */
describe('processErrorMessage', () => {
  it('BALANCE_LOCKED', async function() {
    let rawOnMessage = '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
    const { h: header, d: data } = JSON.parse(rawOnMessage)
    const errorMessage = header[4]
    const result = processErrorMessage(errorMessage)
    assert.equal('BALANCE_LOCKED', result)
  })
  it('INVALID_PAYLOAD"', async function() {
    // {"h":["","2","error","4005","invalid_payload"],"d":[]}
    const rawOnMessage = '{"h":["","2","error","4005","invalid_payload"],"d":[]}'
    const result = processErrorMessage({ rawOnMessage, option })
    assert.equal('UNMET_ERROR_MESSAGE', result)
  })

  it('UNMET_ERROR_MESSAGE', async function() {
    let rawOnMessage =
      '{"h":["modify-order-undefined","2","error","4021","neverHappendBefore"],"d":[]}'
    const result = processErrorMessage({ rawOnMessage, option })
    assert.equal('UNMET_ERROR_MESSAGE', result)
  })
})

describe('processOrderMessage', async function() {
  beforeEach(async function(done) {
    done()
  })

  it.skip('ORDER_BOOK_SNAP', async function() {
    const rawOnMessage =
      '{"h":["order-book.ABT-ETH.1E-7","2","s"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}'
    const result = await processOnMessage({ rawOnMessage, option })
    assert.equal('ORDER_BOOK_SNAP', result)
  })
  it('ORDER_BOOK_UPDATE', async function() {
    const rawOnMessage =
      '{"h":["order-book.ABT-ETH.1E-7","2","u"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}'
    const result = await processOnMessage({ rawOnMessage, option })
    assert.equal('ORDER_BOOK_UPDATE', result)
  })
  it('BALANCE_LOCKED', async function() {
    const rawOnMessage =
      '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
    const result = await processOnMessage({ rawOnMessage, option })
    assert.equal('BALANCE_LOCKED', result)
  })
  it('Catch Error UNMET_ERROR_MESSAGE ', async function() {
    const rawOnMessage = '{"h":["modify-order-undefined","2","error","4021","wtf"],"d":[]}'
    try {
      const result = await processOnMessage({ rawOnMessage, option })
    } catch (error) {
      assert.equal(
        error.message,
        'UNMET_ERROR_MESSAGE Raw onMessage: {"h":["modify-order-undefined","2","error","4021","wtf"],"d":[]}',
      )
    }
  })

  it('Catch Error Unknown ws message ', async function() {
    const rawOnMessage = '{"h":["modify-order-undefined","2","its new","4021","wtf"],"d":[]}'
    try {
      const result = await processOnMessage({ rawOnMessage, option })
    } catch (error) {
      assert.equal(
        error.message,
        'Unknown ws message, Raw onMessage: {"h":["modify-order-undefined","2","its new","4021","wtf"],"d":[]}',
      )
    }
  })

  it('Catch Error UNMET_STATE_TYPES ', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","triggered","trigger_rejected","bid","0.0000001","0","50","0"]}'
    try {
      const result = await processOnMessage({ rawOnMessage, option })
    } catch (error) {}
  })
  it('Catch Error UNMET_EVENT_TYPES ', async function() {
    const rawOnMessage =
      '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","trigger_rejected","bid","0.0000001","0","50","0"]}'
    try {
      const result = await processOnMessage({ rawOnMessage, option })
    } catch (error) {}
  })
})
