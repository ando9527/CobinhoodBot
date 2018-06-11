/**
 * Test any times you want 
 * only like 5 api request in here
 */
'use strict';
import config from 'config'
import bidLib from 'bidLib'
import Cobinhood from 'cobinhood-api-node'
import store from 'store'
import test from 'ava'
import lib from 'lib'
var api = Cobinhood({
    apiSecret: config.apiSecret
});
/**
 * Test it with 1 order only
 */
test.serial('updateData', async t => {
    await lib.updateData()
    const data = ['buyOrder', 'opPrice', 'orderBook']
    data.map(item=>{
        t.not(store.getState()[item], null)
    })
})

test.serial('getLimitProfitBuyOrderFy', async t => {
    const data = [500, 100, 95, 90, 70]
    const asks = data.map(item=>{
        return {price:item}
    })
    const dataB = [69,65,60, 50, 40, 30, 20, 10]
    const bids = dataB.map(item=>{
        return {price:item}
    })
    const profitPercentage = 10
    const newBids = bidLib.getLimitProfitBuyOrderFy({asks, bids, profitPercentage})    
    t.deepEqual(newBids, [{price:60},
                    {price: 50},
                    {price: 40},
                    {price: 30},
                    {price: 20},
                    {price: 10},
                        ])
})

test.serial('getLimitProfitBuyOrder', async t => {
    const {orderBook}= store.getState()
    const newBids = bidLib.getLimitProfitBuyOrder({asks: orderBook.asks, bids: orderBook.bids})
    t.pass(newBids.length!==0, true)
})

test.serial('getExpectedCost', async t => {
    const sellPrice = 900
    const profitPercentage= 800
    const cost = bidLib.getExpectedCost({sellPrice, profitPercentage})
    t.is(cost, 100)
})

test.serial('getExpectedCost', async t => {
    const sellPrice = 0.0009
    const profitPercentage= 800
    const cost = bidLib.getExpectedCost({sellPrice, profitPercentage})
    t.is(cost, 0.0001)
})

test.serial('getExpectedCost', async t => {
    const sellPrice = 0.0000009
    const profitPercentage= 800
    const cost = bidLib.getExpectedCost({sellPrice, profitPercentage})
    t.is(cost, 0.0000001)
})


test.serial('getProfitPercentage', async t => {
    const {buyOrder} = store.getState()
    const epp = lib.getProfitPercentage({price: lib.getLowestAsk().price , productCost: buyOrder.price})
    t.pass()
})

test.serial('getCCPrice', async t => {
    const value = await lib.getCCPrice({from: 'EOS', to: 'ETH'} )
    t.is(typeof value, 'number')
})

test.serial('getCGPrice', async t => {
    const value = await lib.getCGPrice({from: 'EOS', to: 'ETH'} )
    t.is(typeof value, 'number')
})

test.serial('getBelowOpBuyOrder', async t => {
    const data = [80, 70, 30, 50, 100, 120, 150, 130]
    let bids = []
    data.map(item=>{
        bids.push({price:item})
    })
    const opPrice = 100
    const ans = bidLib.getBelowOpBuyOrder({bids, opPrice})
    
    t.deepEqual(ans, [ { price: 100 },
        { price: 80 },
        { price: 70 },
        { price: 50 },
        { price: 30 } ])
        
})




test.serial('getBelowLimitBuyOrder', async t => {
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item=>{
        return {price:item}
    })
    const buyOrder={size:10}
    const limit = 100
    const ans = bidLib.getBelowLimitBuyOrder({bids, buyOrder, limit})
    t.deepEqual(ans, [ { price: 8 },
        { price: 7 },
        { price: 5 },
        { price: 3 },
        { price: 1 } ])
})


test.serial('isReducePrice', async t => {
    const increment = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item=>{
        return {price:item}
    })
    const buyOrder={price:100}

    const ans = bidLib.isReducePrice({bids, buyOrder, increment})
    t.is(ans, true)

    const increment2 = 0.000001
    const data2 = [8, 7, 3, 5, 1, 12, 15.000002, 15.000001]
    let bids2 = data2.map(item=>{
        return {price:item}
    })
    const buyOrder2={price:15.000002}

    const ans2 = bidLib.isReducePrice({bids: bids2, buyOrder:buyOrder2, increment: increment2 })
    t.is(ans2, false)
    
})



test.serial('getReducePriceFactory', async t => {
    const increment = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item=>{
        return {price:item}
    })
    const buyOrder={price:15}
    const price = bidLib.getReducePriceFactory({bids,  increment})
    
    t.is(price, 13.00001)
})



test.serial('getTopPriceFactory', async t => {
    const increment = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    let bids = data.map(item=>{
        return {price:item}
    })
    const price = bidLib.getTopPriceFactory({bids, increment})
    t.is(price, 15.00001)
})




test.serial('isHighestBidOrder', async t => {
    const bids = [{price:20, size:5},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:550, size:5},]
    
    const buyOrder = {price:550, size:5, filled:0, side: "bid"}
    const ans = bidLib.isHighestBidOrder({bids, buyOrder})
    t.is(ans, true)
})
test.serial('isHighestBidOrder', async t => {
    const bids = [{price:20, size:5},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:550, size:5},]
    
    const buyOrder = {price:1, size:100, filled:0, side: "bid"}
    const ans = bidLib.isHighestBidOrder({bids, buyOrder})
    t.is(ans, false)
})
test.serial('isHighestBidOrder', async t => {
    const bids = [{price:20, size:5},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:550, size:600},]
    
    const buyOrder = {price:550, size:100, filled:0, side: "bid"}
    const ans = bidLib.isHighestBidOrder({bids, buyOrder})
    t.is(ans, false)
})

test.serial('isHighestBidOrder', async t => {
    const bids = [{price:20, size:5},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:550, size:5},]
    
    const buyOrder = {price:550, size:5, filled:2, side: "bid"}
    const ans = bidLib.isHighestBidOrder({bids, buyOrder})
    t.is(ans, false)
})





test.serial('inBidPriceBucket', async t => {
    const bids = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]

    const buyOrder = {price:550, size:5, filled:0, side: "bid"}
    const ans = bidLib.inBidPriceBucket({bids, buyOrder})
    t.is(ans, true)
})
test.serial('inBidPriceBucket', async t => {
    const bids = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]

    const buyOrder = {price:6000, size:5, filled:0, side: "bid"}
    const ans = bidLib.inBidPriceBucket({bids, buyOrder})
    t.is(ans, false)
})

test.serial('getValidQuantityCompareFy', async t => {
    const quantityComparePercentage = 50
    const bids = [{price:350, size:10},//1660
                {price:300, size:1600},//1650
                {price:290, size:20},//50
                {price:250, size:20},//30
                {price:220, size:10},//10
                {price:200, size:100},
                {price:150, size:30},
                {price:120, size:20},
                {price:100, size:60},
                {price:50, size:1500},
                {price:20, size:20},]
    const buyOrder = {price:200, size:100}

    const ans = bidLib.getValidQuantityCompareFy({bids, buyOrder, quantityComparePercentage})
    
    t.deepEqual(ans, [{price:350, size:10},//1660
                    {price:300, size:1600},//1650
                    {price:290, size:20},//50
                    {price:200, size:100},
                    {price:150, size:30},
                    {price:120, size:20},
                    {price:100, size:60},
                    {price:50, size:1500},
                    {price:20, size:20}])
})

test.serial('getValidQuantityCompare', async t => {
    const {orderBook, buyOrder} = store.getState()
    const ans =bidLib.getValidQuantityCompare({bids: orderBook.bids, buyOrder})
    t.is(ans.length!==0, true)
})