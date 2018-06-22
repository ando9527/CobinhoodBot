require('dotenv').load()
import { assert } from 'chai'
import { isOrderMatch } from './lib'

describe('lib', () => {
  it('isOrderMatch 1 ', () => {
    const option = { sellOrderId: 'a', mode: 'ASK', symbol: 'c' }
    const order = { id: 'a', side: 'ask', trading_pair_id: 'c' }
    assert.equal(isOrderMatch(order, option), true)
  })

  it('isOrderMatch 2 ', () => {
    const option = { buyOrderId: 'a', mode: 'BID', symbol: 'c' }
    const order = { id: 'a', side: 'BID', trading_pair_id: 'c' }
    assert.equal(isOrderMatch(order, option), true)
  })

  it('isOrderMatch 3', () => {
    const option = { sellOrderId: 'a', mode: 'ASK', symbol: 'c' }
    const order = { id: 'c', side: 'ask', trading_pair_id: 'c' }
    assert.equal(isOrderMatch(order, option), false)
  })
})
