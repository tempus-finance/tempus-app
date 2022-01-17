import { BigNumber } from 'ethers';
import { ONE_ETH_IN_WEI } from '../constants';

const weiInEth = BigNumber.from(ONE_ETH_IN_WEI);

export function mul18f(multiplier: BigNumber, multiplicand: BigNumber, precision?: number): BigNumber {
  const bigNumberPrecision = precision ? BigNumber.from(Math.pow(10, precision).toString()) : weiInEth;
  return multiplier.mul(multiplicand).div(bigNumberPrecision);
}

export function div18f(dividend: BigNumber, divisor: BigNumber, precision?: number): BigNumber {
  const bigNumberPrecision = precision ? BigNumber.from(Math.pow(10, precision).toString()) : weiInEth;
  return dividend.mul(bigNumberPrecision).div(divisor);
}

export function increasePrecision(value: BigNumber, amount: number) {
  const multiplier = BigNumber.from(Math.pow(10, amount).toString());
  return value.mul(multiplier);
}