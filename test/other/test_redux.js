import store from 'reducer'
import test from 'ava'
import bot from 'methods'


test.serial('updateData', async t => {
    await bot.updateData()
    const data = ['buyOrder', 'opPrice', 'orderBook']
    data.map(item=>{
        t.not(store.getState()[item], null)
    })
})