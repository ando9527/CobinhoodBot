import bot from '../methods'
import config from '../config'
import Cobinhood from 'cobinhood-api-node'
import axios from 'axios'
import utils from '../utils'
import lib from '../lib'
const api = Cobinhood({
    apiSecret: config.apiSecret,
})


export const showSpread = async() => {

    const res = await axios.get("http://104.197.222.128:7001/api/cb/eth-ticker")
    const data = res.data.data.map(symbol=>{
        const {trading_pair_id, lowest_ask, highest_bid} = symbol
        const volume24h = symbol["24h_volume"]
        const spread = utils.div(utils.minus(lowest_ask,highest_bid),highest_bid)
        // if (symbol==='IOST-ETH') console.log({symbol: symbol, spread: spread, lowest_ask: lowest_ask, highest_bid:highest_bid})
        return {symbol: trading_pair_id, spread, lowest_ask, highest_bid, volume24h}
    })
    const newData = data.sort(utils.sortVolume24h).reverse()
    console.log(newData)
}


export const getOrder = async()=>{
    const order = await lib.getCurrentOrder()
    return order
}