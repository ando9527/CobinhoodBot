// @flow
export const UPDATE_OP_PRICE = 'UPDATE_OP_PRICE'
export type OpPrice = {
  price: number,
  lastUpdate: string,
}
export type OnOpPriceUpdateAction = {
  type: string,
  payload: { price: number },
}
