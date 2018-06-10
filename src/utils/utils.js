import axios from 'axios'
import config from '../config'
import moment from 'moment'
import colors from 'colors/safe'
import { BigNumber } from 'bignumber.js'
import store from '../reducer';

export const sortNumber = (a, b) => {
  return minus(a, b)
}

export const sortOrder = (a, b) => {
  return minus(a.price, b.price)
}

export const sortVolume24h = (a, b) => {
  return minus(a.volume24h, b.volume24h)
}

export const sendIfttt = (value1 = null, value2 = null, value3 = null) => {
  return axios
    .post(`https://maker.ifttt.com/trigger/${config.iftttEvent}/with/key/${config.iftttKey}`, {
      value1,
      value2,
      value3,
    })
    .then(data => {
      if (data.data !== `Congratulations! You've fired the cbb event`)
        throw Error('IFTTT EVENT sent failed')
    })
}

export const getTime = () => {
  return ''
  // return moment().format('ddd MMM D YYYY hh:mm:ss')
}

export const plus = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .plus(y)
    .decimalPlaces(10)
    .toNumber()
}

export const minus = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .minus(y)
    .decimalPlaces(10)
    .toNumber()
}

export const multi = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .multipliedBy(y)
    .decimalPlaces(10)
    .toNumber()
}

export const div = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .dividedBy(y)
    .decimalPlaces(10)
    .toNumber()
}

export const info = (data = {}) => {
  if (Object.keys(data).length === 0) {
    return 'Nothing to display.'
  }
  let message = ''
  Object.keys(data).forEach(item => {
    message += `${item}: ${data[item]}, `
  })
  return message
}

export const removeProperty = (obj, property) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (key !== property) {
      return { ...acc, [key]: obj[key] }
    }
    return acc
  }, {})
}

export const haltProcess=async(message)=>{

  try {
    
    const record = Object.assign({},store.getState(),{config:null})

    await sendIfttt(
      `${config.mode} - ${config.symbol} - ${message}`,
      JSON.stringify(record),
    )

  } catch (e) {
    console.log(e);
    
  } finally{
    const record = Object.assign({},store.getState(),{config:null})
    console.log('Halt Process');
    console.log(`Error Message ${message}`);
    console.log('Real time data==================================')
    console.log(JSON.stringify(record))
    console.log(`End real time data===============================`)
    process.exit(1)

  }


}