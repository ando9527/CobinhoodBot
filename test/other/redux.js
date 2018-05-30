import store from 'reducer'
import test from 'ava'
import lib from 'lib'

test.serial('updateData', async t => {
    await lib.updateData()
    const {orderBook} = store.getState()
    console.log(orderBook);
    
    // const data = ['buyOrder', 'opPrice', 'orderBook']
    // data.map(item=>{
    //     t.not(store.getState()[item], null)
    // })
})