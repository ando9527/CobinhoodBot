// @flow

export type Option = {
  increment: number,
  decrement: number,
  /**
   * Both mode required.
   */
  apiSecret: string,
  watchOnly: boolean,
  mode: string,
  assetType: string,
  productType: string,
  symbol: string,
  quantityComparePercentage: number,
  profitLimitPercentage: number,
  BOT_CHECK_INTERVAL: number,

  /**
   * IFTTT Setup
   */
  iftttEnable: boolean,
  iftttEvent: string,
  iftttKey: string,

  /**
   * BID MODE
   */
  buyOrderId: string,
  totalPriceLimit: number,
  opPercentage: number,
  BOT_OP_API_URL: string,
  BOT_OP_WS_URL: string,

  /**
   * ASK MODE
   */
  sellOrderId: string,
  productCost: number,
}
