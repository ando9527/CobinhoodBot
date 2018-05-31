import test from 'ava'
import { wobMaker } from '../src/reducer/wob';
test.serial('wobMaker', async t => {

  const state ={bids: [{ price: 0.0001299, count: 5, size: 3000 }], asks: [ { price: 0.0001299, count: 5, size: 3000 } ] }
  const orderBook ={bids: [], asks: [ { price: 0.0001299, count: -1, size: -1430 } ] }
  
  const data = wobMaker({state, orderBook})
  const ans = { asks: [ { price: 0.0001299, count: 4, size: 1570 } ],
                bids: [ { price: 0.0001299, count: 5, size: 3000 } ] }
  t.deepEqual(data, ans )
  
})
