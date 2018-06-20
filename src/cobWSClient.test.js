import { processOrderMessage, processOnMessage, processErrorMessage } from './cobWsClient'
import test from 'ava'

/**
 * processOrderMessage
 */
test.serial('processOrderMessage ', async t => {
  // Balanced Locked
  let rawOnMessage = null
  let result = null
  rawOnMessage = '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
  result = processOnMessage(rawOnMessage)
  t.is('BALANCE_LOCKED', result)

  rawOnMessage = '​​​​​{"h":["order-book.ABT-ETH.1E-7","2","u"],"d":{"bids":[["0.0013309","1","1620.38"]],"asks":[]}}​​​​​'
  result = processOnMessage(rawOnMessage)
  t.is('ORDER_BOOK_SNAP')
})

test.serial('processErrorMessage', async t => {
  let rawOnMessage = '{"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}'
  let errorMessage = 'balance_locked'
  const result = processErrorMessage({ errorMessage, rawOnMessage })
  t.is('BALANCE_LOCKED', result)
})
