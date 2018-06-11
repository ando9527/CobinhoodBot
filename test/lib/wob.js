import test from 'ava'
import store from '../../src/store'
import { updateData } from '../../src/lib/lib'
import { zipOrder } from '../../src/actions/orderBook'
import { wobMaker } from '../../src/store/orderBook';

test.serial('wobMaker1', async t => {
  const state = {
    bids: [{ price: 0.0001299, count: 5, size: 3000 }],
    asks: [{ price: 0.0001299, count: 5, size: 3000 }],
  }
  const orderBook = { bids: [], asks: [{ price: 0.0001299, count: -1, size: -1430 }] }

  const data = wobMaker({ state, orderBook })
  const ans = {
    asks: [{ price: 0.0001299, count: 4, size: 1570 }],
    bids: [{ price: 0.0001299, count: 5, size: 3000 }],
  }
  t.deepEqual(data, ans)
})

test.serial('wobMaker2', async t => {
  const state = {
    bids: [{ price: 0.0001299, count: 5, size: 3000 }],
    asks: [{ price: 0.0001299, count: 5, size: 3000 }],
  }
  const orderBook = { bids: [], asks: [{ price: 0.0001298, count: 1, size: 2000 }] }

  const res = wobMaker({ state, orderBook })
  const ans = {
    asks: [ {price: 0.0001298, count: 1, size: 2000},{ price: 0.0001299, count: 5, size: 3000 }],
    bids: [{ price: 0.0001299, count: 5, size: 3000 }],
  }
  
  
  t.deepEqual(res, ans)
})

test.serial('zipOrder', async t => {
  const data = [
    '9c105d00-ecdc-4b81-9722-456b820c24bf',
    '1527806905810',
    '',
    'ABT-ETH',
    'partially_filled',
    'modified',
    'ask',
    '0.0016099',
    '0.0016174305555556',
    '86.8',
    '72',
  ]
  const res = zipOrder(data)
  const ans = {
    id: '9c105d00-ecdc-4b81-9722-456b820c24bf',
    trading_pair_id: 'ABT-ETH',
    side: 'ask',
    // type: 'limit',
    price: 0.0016099,
    size: 86.8,
    filled: 72,
    state: 'partially_filled',
    timestamp: 1527806905810,
    eq_price: 0.0016174305555556,
    event: 'modified',
    // completed_at: null
  }

  t.deepEqual(res, ans)
})
