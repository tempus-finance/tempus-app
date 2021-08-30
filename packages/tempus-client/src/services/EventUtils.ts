import { BigNumber } from 'ethers';
import TempusAMMService from './TempusAMMService';
import { DepositedEvent, RedeemedEvent } from './TempusControllerService';
import TempusPoolService from './TempusPoolService';
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

export async function getEventPoolAddress(
  event: DepositedEvent | RedeemedEvent | SwapEvent,
  amm: TempusAMMService,
): Promise<string> {
  if (isDepositEvent(event) || isRedeemEvent(event)) {
    return event.args.pool;
  }
  if (isSwapEvent(event)) {
    try {
      return amm.getTempusPoolAddressFromId(event.args.poolId);
    } catch (error) {
      console.error('EventUtils - getEventPoolAddress() - Failed to get swap event pool address!', error);
      return Promise.reject(error);
    }
  }

  throw new Error('EventUtils - getEventPoolAddress() - Invalid event type!');
}

export async function getEventBackingTokenValue(
  event: DepositedEvent | RedeemedEvent | SwapEvent,
  amm: TempusAMMService,
  pool: TempusPoolService,
): Promise<BigNumber> {
  if (isDepositEvent(event) || isRedeemEvent(event)) {
    return event.args.backingTokenValue;
  }
  if (isSwapEvent(event)) {
    try {
      const tempusPoolAddress = await amm.getTempusPoolAddressFromId(event.args.poolId);
      const principalAddress = await pool.getPrincipalTokenAddress(tempusPoolAddress);

      // If tokenIn is principal token, return amountIn it as an event value, otherwise return amountOut as an event value.
      return event.args.tokenIn === principalAddress ? event.args.amountIn : event.args.amountOut;
    } catch (error) {
      console.error('EventUtils - getEventBackingTokenValue() - Failed to get event value in backing tokens.', error);
    }
  }

  throw new Error('EventUtils - getEventBackingTokenValue() - Invalid event type!');
}
