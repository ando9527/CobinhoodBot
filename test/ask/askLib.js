/**
 * Test any times you want 
 * only like 5 api request in here
 */
'use strict';
import config from 'config'
import askLib from 'askLib'
import bot from 'askLib'
import Cobinhood from 'cobinhood-api-node'
import store from 'reducer'
import test from 'ava'
import lib from 'lib'

var api = Cobinhood({
    apiSecret: config.apiSecret
});

test.serial('updateData', async t => {
    await lib.updateData()
    
    const data = ['sellOrder', 'orderBook']
    data.map(item=>{
        t.not(store.getState()[item], null)
    })
})

test.serial('getLimitProfitSellOrder', async t => {
    const {asks} = store.getState().orderBook
    const lPAsks = bot.getLimitProfitSellOrder({asks})    
    t.is(lPAsks.length===0, false)
})

test.serial('getLimitProfitSellOrderFy', async t => {
    const data = [50, 30, 100, 110, 120, 200, 20, 300]
    const asks = data.map(item=>{
        return {price:item}
    })
    const productCost = 100
    const profitLimitPercentage = 10
    //get rid of the price under 110
    const newAsks = bot.getLimitProfitSellOrderFy({asks,productCost, profitLimitPercentage })
    t.deepEqual(newAsks, [ {price: 120 },
                    {price: 200},
                    {price: 300}
                    ])
})

test.serial('getProfitPercentage', async t => {
    const {sellOrder} = store.getState()
    const price = sellOrder.price
    const productCost = config.productCost
    const profit= lib.getProfitPercentage({price, productCost})
    t.is(typeof profit, "number")
})



test.serial('getAboveCostSellOrderFy', async t => {
    const data = [80, 70, 30, 50, 100, 120, 150, 130]
    let asks = []
    data.map(item=>{
        asks.push({price:item})
    })
    const productCost = 100
    
    const ans = bot.getAboveCostSellOrderFy({asks, productCost})
    
    t.deepEqual(ans, [ { price: 120 },
        { price: 130 },
        { price: 150 },])
        
})

test.serial('getAboveCostSellOrder', async t => {
 
    const {orderBook} = store.getState()
    const {asks} = orderBook
    const newAsks = bot.getAboveCostSellOrder({asks})
    t.is(newAsks.length===0, false)
})


test.serial('isGainPriceFactory', async t => {
    const decrement = 0.00001
    const data = [8, 7, 3, 5, 1, 12, 15, 13]
    const asks = data.map(item=>{
        return {price:item}
    })
    const sellOrder= {price:100}
    const ans = bot.isGainPriceFactory({asks, sellOrder, decrement})
    t.is(ans, true)    

    const decrement2 = 0.00001
    const data2 = [8, 7, 3, 5, 2.00002, 2.00003 , 12, 15, 13]
    const asks2 = data2.map(item=>{
        return {price:item}
    })
    const sellOrder2= {price:2.00002}
    const ans2 = bot.isGainPriceFactory({asks: asks2, sellOrder:sellOrder2, decrement:decrement2})
    t.is(ans2, false)     
})

test.serial('isGainPrice', async t => {
    const {orderBook} = store.getState()
    const {asks} = orderBook
    const newAsks = bot.getAboveCostSellOrder({asks})
    bot.isGainPrice({asks:newAsks})
    t.pass()
})

test.serial('getLastPriceFactory', async t => {
    const decrement = 0.000001
    const data = [8, 7, 3, 5,12, 15, 13]
    const asks = data.map(item=>{
        return {price:item}
    })
    const price = bot.getLastPriceFactory({asks,decrement})
    t.is(price, 2.999999)
})

test.serial('getLostPrice', async t => {
    const {orderBook} = store.getState()
    const {asks} = orderBook
    const newAsks = bot.getAboveCostSellOrder({asks})
    const price = bot.getLastPrice({asks:newAsks})
    t.pass()
})


test.serial('getGainedPriceFactory', async t => {
    const decrement = 0.00001
    const data = [8, 7, 5.00001, 3, 12, 15, 13]
    const asks = data.map(item=>{
        return {price:item}
    })

    const price = bot.getGainedPriceFactory({asks, decrement })
    t.is(price, 5)
})

test.serial('getGainedPrice', async t => {
    const {orderBook} = store.getState()
    const {asks} = orderBook
    const newAsks = bot.getAboveCostSellOrder({asks})
    const price = bot.getGainedPrice({asks:newAsks})
    t.pass()
})


test.serial('isLowestAskOrderFactory', async t => {
    let asks = [{price:20, size:5},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:550, size:5},]
    const sellOrder = {price:550, size:5, filled: 0}
    const ans = bot.isLowestAskOrderFactory({asks, sellOrder})
    t.is(ans, false)
})
test.serial('isLowestAskOrderFactory', async t => {
    let asks = [{price:5, size:6},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:120, size:1},]
    const sellOrder = {price:5, size:6,  filled: 0}
    const ans = bot.isLowestAskOrderFactory({asks, sellOrder})
    t.is(ans, true)
})
test.serial('isLowestAskOrderFactory', async t => {
    let asks = [{price:5, size:20},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:120, size:1},]
    const sellOrder = {price:5, size:6,  filled: 0}
    const ans = bot.isLowestAskOrderFactory({asks, sellOrder})
    t.is(ans, false)
})

test.serial('isLowestAskOrderFactory', async t => {
    let asks = [{price:5, size:6},
                {price:30, size:3},
                {price:100, size:5},
                {price:70, size:2},
                {price:90, size:50},
                {price:120, size:1},]
    const sellOrder = {price:5, size:6,  filled: 2}
    const ans = bot.isLowestAskOrderFactory({asks, sellOrder})
    t.is(ans, false)
})

test.serial('isLowestAskOrder', async t => {
    const {orderBook} = store.getState()
    bot.isLowestAskOrder({asks: orderBook.asks})
    t.pass()
})

test.serial('inAskPriceBucket', async t => {
    const asks = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]

    const sellOrder = {price:6000, size:5, filled:0}
    const ans = bot.inAskPriceBucket({asks, sellOrder})
    t.is(ans, false)
})

test.serial('inAskPriceBucket', async t => {
    const asks = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]

    const sellOrder = {price:10, size:5, filled:0}
    const ans = bot.inAskPriceBucket({asks, sellOrder})
    t.is(ans, false)
})

test.serial('inAskPriceBucket', async t => {
    const asks = [{price:20, size:5},
        {price:30, size:3},
        {price:100, size:5},
        {price:70, size:2},
        {price:90, size:50},
        {price:550, size:5},]

    const sellOrder = {price:70, size:5, filled:0}
    const ans = bot.inAskPriceBucket({asks, sellOrder})
    t.is(ans, true)
})

test.serial('getValidQuantityCompareFy', async t => {
    const quantityComparePercentage = 50
    const asks = [{price:350, size:10},
            {price:300, size:1600},
            {price:290, size:20},
            {price:250, size:20},
            {price:220, size:10},
            {price:200, size:100},
            {price:180, size:10},//10
            {price:150, size:20},//30
            {price:120, size:20},//50
            {price:100, size:60},//110
            {price:50, size:1500},//1610
            {price:20, size:20},]//1630
    const sellOrder = {price:200, size:100}
    const ans = bot.getValidQuantityCompareFy({asks, sellOrder, quantityComparePercentage})
    
    t.deepEqual(ans,       [{price:350, size:10},
                            {price:300, size:1600},
                            {price:290, size:20},
                            {price:250, size:20},
                            {price:220, size:10},
                            {price:200, size:100},
                            {price:120, size:20},//50
                            {price:100, size:60},//110
                            {price:50, size:1500},//1610
                            {price:20, size:20},])//1630
       
})


test.serial('getValidQuantityCompare', async t => {
    const {orderBook, sellOrder} = store.getState()
    const ans = bot.getValidQuantityCompare({asks: orderBook.asks, sellOrder})
    t.is(ans.length!==0, true )
})


test.skip('getValidQuantityCompareFy', async t => {
    const quantityComparePercentage = 50
    const asks = [ { price: 0.0000446, count: 1, size: 4000 },
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
        { price: 1, count: 1, size: 227.17149221 } ]
    const sellOrder = {price:200, size:100}
    const ans = askLib.getValidQuantityCompareFy({asks, sellOrder, quantityComparePercentage})
    
    t.deepEqual(ans,       [{price:350, size:10},
                            {price:300, size:1600},
                            {price:290, size:20},
                            {price:250, size:20},
                            {price:220, size:10},
                            {price:200, size:100},
                            {price:120, size:20},//50
                            {price:100, size:60},//110
                            {price:50, size:1500},//1610
                            {price:20, size:20},])//1630
       
})