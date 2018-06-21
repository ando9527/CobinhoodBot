var assert = require('assert')
import logger from './helpers/winston'
const option = {
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
import {
  processOrderMessage,
  processOnMessage,
  processErrorMessage,
  dispatchOrder,
  zipOrderStateMessage,
} from './cobWsClient'
import store from './store'
import { setOrderBook } from './actions/orderBook'
let initialEnv = null

describe('processOrderMessage', function() {
  beforeEach(function(done) {
    done()
  })

  // it('BALANCE_LOCKED', function() {
  //   const rawOnMessage =
  //     '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
  //   const { h: header, d: data } = JSON.parse(rawOnMessage)
  //   const result = processOrderMessage({ data, option })
  //   assert.equal('BALANCE_LOCKED', result)
  // })

  // it('ORDER_BOOK_SNAP', function() {
  //   const rawOnMessage =
  //     '{"h":["order-book.ABT-ETH.1E-7","2","s"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}'
  //     const { h: header, d: data } = JSON.parse(rawOnMessage)
  //   const result = processOrderMessage({ data, option })
  //   assert.equal('ORDER_BOOK_SNAP', result)
  // })
  // it('ORDER_BOOK_UPDATE', function() {
  //   const rawOnMessage =
  //     '{"h":["order-book.ABT-ETH.1E-7","2","u"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}'
  //     const { h: header, d: data } = JSON.parse(rawOnMessage)
  //   const result = processOrderMessage({ data, option })
  //   assert.equal('ORDER_BOOK_UPDATE', result)
  // })

  // it('UNMET_EVENT_TYPES', function() {
  //   const rawOnMessage =
  //     '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","trigger_rejected","bid","0.0000001","0","50","0"]}'
  //     const { h: header, d: data } = JSON.parse(rawOnMessage)
  //     const result = processOrderMessage({ data, option })
  //   assert.equal('UNMET_EVENT_TYPES', result)
  // })

  // it('MODIFY_REJECTED', function() {
  //   const rawOnMessage =
  //     '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}'
  //     const { h: header, d: data } = JSON.parse(rawOnMessage)
  //     const result = processOrderMessage({ data, option })
  //   assert.equal('MODIFY_REJECTED', result)
  // })

  // it('IRRELEVANT_ORDER', function() {
  //   const rawOnMessage =
  //     '{"h":["order","2","u","0"],"d":["different-order9-d938d878a6c0s","1529438496388","","FSN-ETH","open","modify_rejected","bid","0.0000001","0","50","0"]}'
  //     const { h: header, d: data } = JSON.parse(rawOnMessage)
  //     const result = processOrderMessage({ data, option })
  //   assert.equal('IRRELEVANT_ORDER', result)
  // })

  // it('PARTIALLY FILLED:', function() {
  //   const rawOnMessage =
  //     '{"h":["order","2","u","0"],"d":["6136e360-da2c-4f7e-bcc9-d938d878a6c0","1529438496388","","FSN-ETH","partially_filled","executed","bid","0.0000001","0","50","0"]}'
  //     const { h: header, d: data } = JSON.parse(rawOnMessage)
  //     const result = processOrderMessage({ data, option })
  //   assert.equal('PARTIALLY FILLED:', result)
  // })
})

// describe('processErrorMessage', () => {
//   it('BALANCE_LOCKED', function() {
//     let rawOnMessage = '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
//     let errorMessage = 'balance_locked'
//     const result = processOnMessage({ rawOnMessage, option })
//     assert.equal('BALANCE_LOCKED', result)
//   })
// })

// describe('processOrderMessage', function() {
//   beforeEach(function(done) {
//     done()
//   })

//   it('BALANCE_LOCKED', function() {
//     const rawOnMessage =
//       '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
//     const result = processOnMessage({ rawOnMessage, option })
//     assert.equal('BALANCE_LOCKED', result)
//   })
// })
