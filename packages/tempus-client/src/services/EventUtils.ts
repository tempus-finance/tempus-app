import { ethers } from 'ethers';
import { DepositedEvent, RedeemedEvent } from './TempusPoolService';

/**
 * Returns amount of backing tokens transferred for an event.
 */
export function getEventValue(event: DepositedEvent | RedeemedEvent) {
  const exchangeRate = Number(ethers.utils.formatEther(event.args.rate));

  if (isDepositEvent(event)) {
    return Number(ethers.utils.formatEther(event.args.yieldTokenAmount)) * exchangeRate;
  }
  if (isRedeemEvent(event)) {
    return Number(ethers.utils.formatEther(event.args.yieldBearingAmount)) * exchangeRate;
  } else {
    throw new Error('Failed to get event value.');
  }
}

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
