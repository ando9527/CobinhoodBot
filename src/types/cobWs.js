// @flow

/**
 * 'balance_locked' added by custom
 */

export type WsState =
  | 'open'
  | 'queued'
  | 'partially_filled'
  | 'filled'
  | 'cancelled'
  | 'pending_cancellation'
  | 'rejected'
  | 'triggered'
  | 'pending_modification'

export type WsEvent =
  | 'opened'
  | 'modified'
  | 'executed'
  | 'triggered'
  | 'cancelled'
  | 'cancel_pending'
  | 'cancel_rejected'
  | 'modify_rejected'
  | 'execute_rejected'
  | 'trigger_rejected'
  | 'balance_locked'

export type WsChannelData = {
  id: string,
  timestamp: number,
  trading_pair_id: string,
  state: WsState,
  event: WsEvent,
  side: 'bid' | 'ask',
  price: number,
  eq_price: number,
  size: number,
  filled: number,
}
