import store from 'reducer'
import test from 'ava'
import lib from 'lib'
import logger from '../../src/utils/winston';
test.serial('updateData', async t => {
    await lib.updateData()
    const {orderBook} = store.getState()
    logger.info(orderBook);
    
    // const data = ['buyOrder', 'opPrice', 'orderBook']
    // data.map(item=>{
    //     t.not(store.getState()[item], null)
    // })
})