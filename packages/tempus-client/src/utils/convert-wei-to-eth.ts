import { BigNumber } from 'ethers';

export default function weiToEth(wei: BigNumber): BigNumber {
  const weiInEth = BigNumber.from('1000000000000000000');

  return wei.div(weiInEth);
}
