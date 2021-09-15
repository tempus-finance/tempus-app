import { BigNumber } from 'ethers';

const weiInEth = BigNumber.from('1000000000000000000');

export function mul18f(a: BigNumber, b: BigNumber): BigNumber {
  return a.mul(b).div(weiInEth);
}

export function div18f(a: BigNumber, b: BigNumber): BigNumber {
  return a.mul(weiInEth).div(b);
}
