export const zipOrder = (order: Array<string | number>) => {
  const id = order[0]
  const timestamp = parseFloat(order[1])
  const trading_pair_id = order[3]
  const state = order[4]
  const event = order[5]
  const side = order[6]
  const price = parseFloat(order[7])
  const eq_price = parseFloat(order[8])
  const size = parseFloat(order[9])
  const filled = parseFloat(order[10])

  return Object.assign(
    {},
    { id, timestamp, trading_pair_id, state, event, side, price, eq_price, size, filled },
  )
}

// state: 'partially_filled',
// ​​​​​  event: 'executed',
const x = [
  '17e7de41-6adb-4695-901f-308d2becc64b',
  '1528271149364',
  '',
  'MFG-ETH',
  'partially_filled',
  'executed',
  'ask',
  '0.0000334',
  '0.0000334',
  '9000',
  '4173.15793413',
]
const order = zipOrder(x)
console.log(order)
const { event, id, state } = order
const eventTypes = ['modified', 'opened']
console.log(event)
console.log(state)

if (eventTypes.includes(event) || (event === 'executed' && state === 'partially_filled')) {
  console.log('123')

  if (event === 'balance_locked') {
    logger.info(event)
  }
} else {
  console.log('else')
}
