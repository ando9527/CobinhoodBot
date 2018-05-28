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
import lib from 'lib'
import askLib from 'askLib'
import bidLib from 'bidLib'

var api = Cobinhood({
    apiSecret: config.apiSecret
});

test.serial('updateData', async t => {
    await lib.updateData()
    const data = ['orderBook']
    data.map(item=>{
        t.not(store.getState()[item], null)
    })
})

test.serial('getHighestBidFy', async t => {
    let bids = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]
    const bid = lib.getHighestBidFy({bids})
    const price = parseFloat(bid.price)
    t.is(price, 550)
    
    t.pass()
})

test.serial('getHighestBid', async t => {
    const bid = lib.getHighestBid()
    const price = parseFloat(bid.price)
    t.is(typeof price, "number")
})

test.serial('getLowestAskFy', async t => {
    let asks = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]
    const ask = lib.getLowestAskFy({asks})
    const price = parseFloat(ask.price)
    t.is(price, 20)
})

test.serial('getLowestAsk', async t => {
    const ask = lib.getLowestAsk()
    const price = parseFloat(ask.price)
    t.is(typeof price, "number")
})

test.serial('getProfitPercentage', async t => {
    const price = 50
    const productCost = 25
    const profit = lib.getProfitPercentage({price, productCost})
    t.is(profit, 100.00)
})

test.serial('getProfitPercentage', async t => {
    const price = "0.0031486"
    const productCost = "0.0026609"
    const profit= lib.getProfitPercentage({price, productCost})
    t.is(profit, 18.33)
})


test.serial('packageOrder', async t => {
    const order =     { id: '23305b1d-584c-4389-bad2-3aca7a19e780',
                        trading_pair: 'IOST-ETH',
                        side: 'bid',
                        type: 'limit',
                        price: '0.0000101',
                        size: '1000',
                        filled: '0',
                        state: 'open',
                        timestamp: 1519071138754,
                        eq_price: '0',
                        completed_at: null }

    const ans = lib.packageOrder({order})
    t.deepEqual(ans,    { id: '23305b1d-584c-4389-bad2-3aca7a19e780',
                    trading_pair: 'IOST-ETH',
                    side: 'bid',
                    type: 'limit',
                    price: 0.0000101,
                    size: 1000,
                    filled: 0,
                    state: 'open',
                    timestamp: 1519071138754,
                    eq_price: 0,
                    completed_at: null })
    
})

test.serial('packageOrderBook', async t => {
    const orderBook = { asks:
        [ { price: '0.0000467', count: '1', size: '59.3663213' },
          { price: '0.0000479', count: '3', size: '8172.03366328' },
          { price: '0.0000484', count: '1', size: '2915.42576887' },
          { price: '0.0000549', count: '1', size: '1000' },
          { price: '0.9', count: '1', size: '800' },
          { price: '1', count: '1', size: '602' },
          { price: '998', count: '1', size: '601' } ],
       bids:
        [ { price: '0.0000389', count: '1', size: '20000' },
          { price: '0.0000387', count: '1', size: '5000' },
          { price: '0.0000383', count: '1', size: '14666.10155' },
          { price: '0.0000011', count: '3', size: '65362.95642317' },
          { price: '0.000001', count: '3', size: '56007.00000654' },
          { price: '0.0000001', count: '3', size: '96000' } ] }
    const ans = lib.packageOrderBook({orderBook})
    t.deepEqual(ans, { asks:
        [ { price: 0.0000467, count: 1, size: 59.3663213 },
          { price: 0.0000479, count: 3, size: 8172.03366328 },
          { price: 0.0000484, count: 1, size: 2915.42576887 },
          { price: 0.0000549, count: 1, size: 1000 },
          { price: 0.9, count: 1, size: 800 },
          { price: 1, count: 1, size: 602 },
          { price: 998, count: 1, size: 601 } ],
       bids:
        [ { price: 0.0000389, count: 1, size: 20000 },
          { price: 0.0000387, count: 1, size: 5000 },
          { price: 0.0000383, count: 1, size: 14666.10155 },
          { price: 0.0000011, count: 3, size: 65362.95642317 },
          { price: 0.000001, count: 3, size: 56007.00000654 },
          { price: 0.0000001, count: 3, size: 96000 } ] })
})


