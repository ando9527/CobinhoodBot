import { assert } from 'chai'
import store from '../store'
import {
  getLimitProfitSellOrderFy,
  getAboveCostSellOrder,
  isGainPrice,
  isGainPriceFactory,
  getLastPrice,
  getGainedPrice,
  isLowestAskOrderFactory,
  inAskPriceBucket,
  getValidQuantityCompareFy,
} from './askLib'
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

describe('askLib', () => {
  it('updateData', () => {
    const data = ['sellOrder', 'orderBook']
    data.map(item => {
      assert.equal(store.getState()[item], null)
    })
  })
  it('getLimitProfitSellOrder', () => {
    const data = [50, 30, 100, 110, 120, 200, 20, 300]
    const asks = data.map(item => {
      return { price: item }
    })
    const productCost = 100
    const profitLimitPercentage = 10
    //get rid of the price under 110
    const newAsks = getLimitProfitSellOrderFy({ asks, productCost, profitLimitPercentage })
    console.log(newAsks)

    assert.deepEqual(newAsks, [{ price: 120 }, { price: 200 }, { price: 300 }])
  })

  it('getProfitPercentage', () => {
    const data = [80, 70, 30, 50, 100, 120, 150, 130]
    let asks = []
    data.map(item => {
      asks.push({ price: item })
    })
    const productCost = 100

    const ans = getAboveCostSellOrder({ asks, productCost })

    assert.deepEqual(ans, [{ price: 120 }, { price: 130 }, { price: 150 }])
  })

  it('isGainPriceFactory', () => {
    const decrement = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    const asks = data.map(item => {
      return { price: item }
    })
    const sellOrder = { price: 100 }
    const ans = isGainPriceFactory({ asks, sellOrder, decrement })
    assert.equal(ans, true)

    const decrement2 = 0.00001
    const data2 = [8, 7, 3, 5, 2.00002, 2.00003, 12, 15, 13]
    const asks2 = data2.map(item => {
      return { price: item }
    })
    const sellOrder2 = { price: 2.00002 }
    const ans2 = isGainPriceFactory({ asks: asks2, sellOrder: sellOrder2, decrement: decrement2 })
    assert.equal(ans2, false)
  })

  it('getLastPrice', () => {
    const decrement = 0.000001
    const data = [8, 7, 3, 5, 12, 15, 13]
    const asks = data.map(item => {
      return { price: item }
    })
    const price = getLastPrice({ asks, decrement })
    assert.equal(price, 2.999999)
  })

  it('getGainedPrice', () => {
    const decrement = 0.00001
    const data = [8, 7, 5.00001, 3, 12, 15, 13]
    const asks = data.map(item => {
      return { price: item }
    })

    const price = getGainedPrice({ asks, decrement })
    assert.equal(price, 5)
  })

  it('isLowestAskOrderFactory', () => {
    let asks = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]
    const sellOrder = { price: 550, size: 5, filled: 0 }
    const ans = isLowestAskOrderFactory({ asks, sellOrder })
    assert.equal(ans, false)
  })

  it('isLowestAskOrderFactory', () => {
    let asks = [
      { price: 5, size: 6 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 120, size: 1 },
    ]
    const sellOrder = { price: 5, size: 6, filled: 0 }
    const ans = isLowestAskOrderFactory({ asks, sellOrder })
    assert.equal(ans, true)
  })
  it('isLowestAskOrderFactory', () => {
    let asks = [
      { price: 5, size: 20 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 120, size: 1 },
    ]
    const sellOrder = { price: 5, size: 6, filled: 0 }
    const ans = isLowestAskOrderFactory({ asks, sellOrder })
    assert.equal(ans, false)
  })
  it('isLowestAskOrderFactory', () => {
    let asks = [
      { price: 5, size: 6 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 120, size: 1 },
    ]
    const sellOrder = { price: 5, size: 6, filled: 2 }
    const ans = isLowestAskOrderFactory({ asks, sellOrder })
    assert.equal(ans, false)
  })

  it('inAskPriceBucket', () => {
    const asks = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const sellOrder = { price: 6000, size: 5, filled: 0 }
    const ans = inAskPriceBucket({ asks, sellOrder })
    assert.equal(ans, false)
  })
  it('inAskPriceBucket', () => {
    const asks = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const sellOrder = { price: 10, size: 5, filled: 0 }
    const ans = inAskPriceBucket({ asks, sellOrder })
    assert.equal(ans, false)
  })
  it('inAskPriceBucket', () => {
    const asks = [
      { price: 20, size: 5 },
      { price: 30, size: 3 },
      { price: 100, size: 5 },
      { price: 70, size: 2 },
      { price: 90, size: 50 },
      { price: 550, size: 5 },
    ]

    const sellOrder = { price: 70, size: 5, filled: 0 }
    const ans = inAskPriceBucket({ asks, sellOrder })
    assert.equal(ans, true)
  })
  it('getValidQuantityCompareFy', () => {
    const quantityComparePercentage = 50
    const asks = [
      { price: 350, size: 10 },
      { price: 300, size: 1600 },
      { price: 290, size: 20 },
      { price: 250, size: 20 },
      { price: 220, size: 10 },
      { price: 200, size: 100 },
      { price: 180, size: 10 }, //10
      { price: 150, size: 20 }, //30
      { price: 120, size: 20 }, //50
      { price: 100, size: 60 }, //110
      { price: 50, size: 1500 }, //1610
      { price: 20, size: 20 },
    ] //1630
    const sellOrder = { price: 200, size: 100 }
    const ans = getValidQuantityCompareFy({ asks, sellOrder, quantityComparePercentage })

    assert.deepEqual(ans, [
      { price: 350, size: 10 },
      { price: 300, size: 1600 },
      { price: 290, size: 20 },
      { price: 250, size: 20 },
      { price: 220, size: 10 },
      { price: 200, size: 100 },
      { price: 120, size: 20 }, //50
      { price: 100, size: 60 }, //110
      { price: 50, size: 1500 }, //1610
      { price: 20, size: 20 },
    ]) //1630
  })

  it.skip('getValidQuantityCompareFy', () => {
    const quantityComparePercentage = 50
    const asks = [
      { price: 0.0000446, count: 1, size: 4000 },
      { price: 0.0000448, count: 1, size: 3723.40425532 },
      { price: 0.0000449, count: 1, size: 4098.752 },
      { price: 0.000045, count: 2, size: 14000 },
      { price: 0.0000466, count: 2, size: 2800 },
      { price: 0.0000467, count: 1, size: 806.6843342 },
      { price: 0.0000468, count: 1, size: 319.63833103 },
      { price: 0.0000469, count: 1, size: 36150 },
      { price: 0.000047, count: 1, size: 8050 },
      { price: 0.0000477, count: 1, size: 50000 },
      { price: 0.000048, count: 1, size: 3000 },
      { price: 0.0000483, count: 1, size: 4000 },
      { price: 0.0000484, count: 1, size: 2915.42576887 },
      { price: 0.0000498, count: 1, size: 21000 },
      { price: 0.0000511, count: 1, size: 300000 },
      { price: 0.0000512, count: 1, size: 1000 },
      { price: 0.0000515, count: 1, size: 1000 },
      { price: 0.0000517, count: 2, size: 3074 },
      { price: 0.000052, count: 1, size: 4307 },
      { price: 0.000055, count: 1, size: 1000 },
      { price: 0.0000551, count: 1, size: 1000 },
      { price: 0.0000552, count: 2, size: 8000 },
      { price: 0.0000555, count: 1, size: 3000 },
      { price: 0.0000568, count: 1, size: 3250 },
      { price: 0.00006, count: 1, size: 20000 },
      { price: 0.0000787, count: 1, size: 1591.317 },
      { price: 0.0000824, count: 1, size: 1000 },
      { price: 0.0000886, count: 1, size: 4000 },
      { price: 0.0000887, count: 1, size: 1000 },
      { price: 0.000093, count: 1, size: 1000 },
      { price: 0.0000935, count: 1, size: 1000 },
      { price: 0.0000996, count: 1, size: 5000 },
      { price: 0.0000997, count: 1, size: 18000 },
      { price: 0.0000998, count: 2, size: 7398 },
      { price: 0.0001, count: 1, size: 19000 },
      { price: 0.0001029, count: 1, size: 808 },
      { price: 0.000103, count: 1, size: 2314.86261729 },
      { price: 0.0001032, count: 1, size: 32.81787998 },
      { price: 0.000125, count: 1, size: 1000 },
      { price: 0.000132, count: 1, size: 1000 },
      { price: 0.000145, count: 1, size: 1000 },
      { price: 0.0001819, count: 1, size: 2000 },
      { price: 0.000182, count: 1, size: 1000 },
      { price: 0.000368, count: 1, size: 20000 },
      { price: 0.000388, count: 1, size: 888 },
      { price: 0.0033, count: 1, size: 20000 },
      { price: 0.003388, count: 1, size: 800 },
      { price: 1, count: 1, size: 227.17149221 },
    ]
    const sellOrder = { price: 200, size: 100 }
    const ans = getValidQuantityCompareFy({ asks, sellOrder, quantityComparePercentage })

    assert.deepEqual(ans, [
      { price: 350, size: 10 },
      { price: 300, size: 1600 },
      { price: 290, size: 20 },
      { price: 250, size: 20 },
      { price: 220, size: 10 },
      { price: 200, size: 100 },
      { price: 120, size: 20 }, //50
      { price: 100, size: 60 }, //110
      { price: 50, size: 1500 }, //1610
      { price: 20, size: 20 },
    ]) //1630
  })
})
