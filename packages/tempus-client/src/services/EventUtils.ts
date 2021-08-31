import { DepositedEvent, RedeemedEvent } from './TempusControllerService';
import { SwapEvent } from './VaultService';

/**
 * Type guard - Checks if provided event is of type DepositedEvent
 */
export function isDepositEvent(event: DepositedEvent | RedeemedEvent | SwapEvent): event is DepositedEvent {
  return 'yieldTokenAmount' in event.args;
}

/**
 * Type guard - Checks if provided event is of type RedeemedEvent
 */
export function isRedeemEvent(event: DepositedEvent | RedeemedEvent | SwapEvent): event is RedeemedEvent {
  return 'yieldBearingAmount' in event.args;
}

/**
 * Type guard - Checks if provided event is of type SwapEvent
 */
export function isSwapEvent(event: DepositedEvent | RedeemedEvent | SwapEvent): event is SwapEvent {
  return 'tokenIn' in event.args;
}
