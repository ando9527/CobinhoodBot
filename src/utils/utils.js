// @flow
import axios from 'axios'
import moment from 'moment'
import colors from 'colors/safe'
import { BigNumber } from 'bignumber.js'
import store from '../store'
import logger from '../helpers/winston'
import type { Order } from '../types/orderBook'
import type { Option } from '../types/option'
import _ from 'lodash'
export const sortNumber = (a: number, b: number) => {
  return minus(a, b)
}

export const sortOrder = (a: Order, b: Order) => {
  return minus(a.price, b.price)
}

export const sendIfttt = ({
  value1,
  value2,
  value3,
  option,
}: {
  value1: string,
  value2?: string,
  value3?: string,
  option: Option,
}) => {
  if (process.env.NODE_ENV !== 'production') return
  return axios
    .post(`https://maker.ifttt.com/trigger/${option.iftttEvent}/with/key/${option.iftttKey}`, {
      value1,
      value2,
      value3,
    })
    .then(data => {
      logger.info(data.data)
    })
    .catch(err => {
      console.log(err)
      console.error(err)
      console.log('IFTTT sent Failed')
      logger.info('Leaving process..')
      process.exit(1)
    })
}

export const getTime = () => {
  return ''
  // return moment().format('ddd MMM D YYYY hh:mm:ss')
}

export const plus = (a: number, b: number) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .plus(y)
    .decimalPlaces(10)
    .toNumber()
}

export const minus = (a: number, b: number) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .minus(y)
    .decimalPlaces(10)
    .toNumber()
}

export const multi = (a: number, b: number) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .multipliedBy(y)
    .decimalPlaces(10)
    .toNumber()
}

export const div = (a: number, b: number) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .dividedBy(y)
    .decimalPlaces(10)
    .toNumber()
}

// export const info = (data = {}) => {
//   if (Object.keys(data).length === 0) {
//     return 'Nothing to display.'
//   }
//   let message = ''
//   Object.keys(data).forEach(item => {
//     message += `${item}: ${data[item]}, `
//   })
//   return message
// }

export const removeProperty = (obj: Object, property: string) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (key !== property) {
      return { ...acc, [key]: obj[key] }
    }
    return acc
  }, {})
}

export const isSubset = (subSet: Object, superSet: Object) =>
  _.every(subSet, (val, key) => _.isEqual(val, superSet[key]))
