import { DepositedEvent, RedeemedEvent } from './TempusControllerService';

/**
 * Type guard - Checks if provided event is of type DepositedEvent
 */
export function isDepositEvent(event: DepositedEvent | RedeemedEvent): event is DepositedEvent {
  return 'yieldTokenAmount' in event.args;
}

/**
 * Type guard - Checks if provided event is of type RedeemedEvent
 */
export function isRedeemEvent(event: DepositedEvent | RedeemedEvent): event is RedeemedEvent {
  return 'yieldBearingAmount' in event.args;
}
