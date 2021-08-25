import { BigNumber } from 'ethers';

const weiInEth = BigNumber.from('1000000000000000000');

export default function weiToEth(wei: BigNumber): BigNumber {
  return wei.div(weiInEth);
}
