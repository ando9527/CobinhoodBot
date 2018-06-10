
// @flow
export const onOpPriceUpdate = ({ payload }: {payload: {price: number}}) => {
  return { type: 'UPDATE_OP_PRICE', payload }
}
