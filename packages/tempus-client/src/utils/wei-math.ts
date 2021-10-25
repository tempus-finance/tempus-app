import { BigNumber } from 'ethers';
import { ONE_ETH_IN_WEI } from '../constants';

const weiInEth = BigNumber.from(ONE_ETH_IN_WEI);

export function mul18f(a: BigNumber, b: BigNumber, precision?: number): BigNumber {
  const bigNumberPrecision = precision ? BigNumber.from(Math.pow(10, precision)) : weiInEth;
  return a.mul(b).div(bigNumberPrecision);
}

export function div18f(a: BigNumber, b: BigNumber, precision?: number): BigNumber {
  const bigNumberPrecision = precision ? BigNumber.from(Math.pow(10, precision)) : weiInEth;
  return a.mul(bigNumberPrecision).div(b);
}
