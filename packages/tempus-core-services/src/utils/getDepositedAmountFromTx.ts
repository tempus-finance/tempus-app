import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { Decimal, DEFAULT_DECIMAL_PRECISION } from '../datastructures';
import ERC20ABI from '../abi/ERC20.json';

export async function getDepositAmountFromTx(
  tx: ContractTransaction,
  depositedTokenAddress: string,
  depositedTokenPrecision: number,
  walletAddress: string,
): Promise<Decimal> {
  let depositedAmount = new Decimal(0);

  // Wait for tx to finish in case it's still pending
  const receipt = await tx.wait();

  // ETH was deposited
  if (!tx.value.isZero()) {
    // ETH has default token precision
    return new Decimal(BigNumber.from(tx.value), DEFAULT_DECIMAL_PRECISION);
  }

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.from === walletAddress) {
        if (depositedTokenAddress.toLowerCase() === log.address.toLowerCase()) {
          depositedAmount = new Decimal(logData.args.value, depositedTokenPrecision);
        }
      }
    } catch (error) {
      console.log('getDepositAmountFromTx() - No matching event found in transaction receipt log, skipping log.');
    }
  });

  return depositedAmount;
}
