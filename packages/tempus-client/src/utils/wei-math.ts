import { BigNumber } from 'ethers';
import { ONE_ETH_IN_WEI } from '../constants';

const weiInEth = BigNumber.from(ONE_ETH_IN_WEI);

export function mul18f(a: BigNumber, b: BigNumber): BigNumber {
  return a.mul(b).div(weiInEth);
}

export function div18f(a: BigNumber, b: BigNumber): BigNumber {
  return a.mul(weiInEth).div(b);
}
