require('dotenv').load()
import { assert } from 'chai'
import store from '../store'
import { updateData, getCCPrice } from '../lib/lib'
import {
  getLimitProfitBuyOrder,
  getExpectedCost,
  getBelowOpBuyOrder,
  getBelowLimitBuyOrder,
  isReducePrice,
  getReducePrice,
  getTopPrice,
  isHighestBidOrder,
  inBidPriceBucket,
} from './bidLib'
import { getValidQuantityCompare } from '../bidLib/bidLib'
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

describe('bidLib', () => {
  it('getLimitProfitBuyOrder', () => {
    const data = [500, 100, 95, 90, 70]
    const asks = data.map(item => {
      return { price: item }
    })
    const dataB = [69, 65, 60, 50, 40, 30, 20, 10]
    const bids = dataB.map(item => {
      return { price: item }
    })
    const profitLimitPercentage = 10
    const newBids = getLimitProfitBuyOrder({ asks, bids, profitLimitPercentage })
    assert.deepEqual(newBids, [
      { price: 60 },
      { price: 50 },
      { price: 40 },
      { price: 30 },
      { price: 20 },
      { price: 10 },
    ])
  })

  it('getExpectedCost', () => {
    const sellPrice = 900
    const profitLimitPercentage = 800
    const cost = getExpectedCost({ sellPrice, profitLimitPercentage })
    assert.equal(cost, 100)
  })
  it('getExpectedCost', () => {
    const sellPrice = 0.0009
    const profitLimitPercentage = 800
    const cost = getExpectedCost({ sellPrice, profitLimitPercentage })
    assert.equal(cost, 0.0001)
  })
  it('getExpectedCost', () => {
    const sellPrice = 0.0000009
    const profitLimitPercentage = 800
    const cost = getExpectedCost({ sellPrice, profitLimitPercentage })
    assert.equal(cost, 0.0000001)
  })
  it.skip('getCCPrice', async () => {
    const value = await getCCPrice({ from: 'EOS', to: 'ETH', option })
    assert.equal(typeof value, 'number')
  })

  it('getBelowOpBuyOrder', () => {
    const data = [80, 70, 30, 50, 100, 120, 150, 130]
    let bids = []
    data.map(item => {
      bids.push({ price: item })
    })
    const opPrice = 100
    const increment = 1e-7
    const opPercentage = 10
    const ans = getBelowOpBuyOrder({ bids, opPrice, increment, opPercentage })

    assert.deepEqual(ans, [
      { price: 100 },
      { price: 80 },
      { price: 70 },
      { price: 50 },
      { price: 30 },
    ])
  })
  it('getBelowLimitBuyOrder', () => {
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item => {
      return { price: item }
    })
    const buyOrder = { size: 10 }
    const limit = 100
    const increment = 1e-7
    const ans = getBelowLimitBuyOrder({ bids, buyOrder, limit, increment })
    assert.deepEqual(ans, [{ price: 8 }, { price: 7 }, { price: 5 }, { price: 3 }, { price: 1 }])
  })

  it('isReducePrice', () => {
    const increment = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item => {
      return { price: item }
    })
    const buyOrder = { price: 100 }

    const ans = isReducePrice({ bids, buyOrder, increment })
    assert.equal(ans, true)

    const increment2 = 0.000001
    const data2 = [8, 7, 3, 5, 1, 12, 15.000002, 15.000001]
    let bids2 = data2.map(item => {
      return { price: item }
    })
    const buyOrder2 = { price: 15.000002 }

    const ans2 = isReducePrice({ bids: bids2, buyOrder: buyOrder2, increment: increment2 })
    assert.equal(ans2, false)
  })
  it('getReducePrice', () => {
    const increment = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item => {
      return { price: item }
    })
    const buyOrder = { price: 15 }
    const price = getReducePrice({ bids, increment })

    assert.equal(price, 13.00001)
  })
  it('getTopPrice', () => {
    const increment = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item => {
      return { price: item }
    })
    const price = getTopPrice({ bids, increment })
    assert.equal(price, 15.00001)
  })
  it('isHighestBidOrder', () => {
    const bids = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const buyOrder = { price: 550, size: 5, filled: 0, side: 'bid' }
    const ans = isHighestBidOrder({ bids, buyOrder })
    assert.equal(ans, true)
  })
  it('isHighestBidOrder', () => {
    const bids = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const buyOrder = { price: 1, size: 100, filled: 0, side: 'bid' }
    const ans = isHighestBidOrder({ bids, buyOrder })
    assert.equal(ans, false)
  })
  it('isHighestBidOrder', () => {
    const bids = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 600 },
    ]

    const buyOrder = { price: 550, size: 100, filled: 0, side: 'bid' }
    const ans = isHighestBidOrder({ bids, buyOrder })
    assert.equal(ans, false)
  })
  it('isHighestBidOrder', () => {
    const bids = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const buyOrder = { price: 550, size: 5, filled: 2, side: 'bid' }
    const ans = isHighestBidOrder({ bids, buyOrder })
    assert.equal(ans, false)
  })
  it('inBidPriceBucket', () => {
    const bids = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const buyOrder = { price: 6000, size: 5, filled: 0, side: 'bid' }
    const ans = inBidPriceBucket({ bids, buyOrder })
    assert.equal(ans, false)
  })
  it('getValidQuantityCompareFy', () => {
    const quantityComparePercentage = 50
    const bids = [
      { price: 350, size: 10 }, //1660
      { price: 300, size: 1600 }, //1650
      { price: 290, size: 20 }, //50
      { price: 250, size: 20 }, //30
      { price: 220, size: 10 }, //10
      { price: 200, size: 100 },
      { price: 150, size: 30 },
      { price: 120, size: 20 },
      { price: 100, size: 60 },
      { price: 50, size: 1500 },
      { price: 20, size: 20 },
    ]
    const buyOrder = { price: 200, size: 100 }

    const ans = getValidQuantityCompare({ bids, buyOrder, quantityComparePercentage })

    assert.deepEqual(ans, [
      { price: 350, size: 10 }, //1660
      { price: 300, size: 1600 }, //1650
      { price: 290, size: 20 }, //50
      { price: 200, size: 100 },
      { price: 150, size: 30 },
      { price: 120, size: 20 },
      { price: 100, size: 60 },
      { price: 50, size: 1500 },
      { price: 20, size: 20 },
    ])
  })
})
