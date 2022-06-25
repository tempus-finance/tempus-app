import { ContractTransaction, ethers } from 'ethers';
import { Decimal } from '../datastructures';
import ERC20ABI from '../abi/ERC20.json';

export async function getWithdrawnAmountFromTx(
  tx: ContractTransaction,
  withdrawnTokenAddress: string,
  withdrawnTokenPrecision: number,
  walletAddress: string,
): Promise<Decimal> {
  let withdrawnAmount = new Decimal(0);

  // Wait for tx to finish in case it's still pending
  const receipt = await tx.wait();

  const ifc = new ethers.utils.Interface(ERC20ABI);
  receipt.logs.forEach(log => {
    try {
      const logData = ifc.parseLog(log);
      if (logData.name === 'Transfer' && logData.args.to === walletAddress) {
        if (log.address.toLowerCase() === withdrawnTokenAddress.toLowerCase()) {
          withdrawnAmount = new Decimal(logData.args.value, withdrawnTokenPrecision);
        }
      }
    } catch (error) {
      console.log('getWithdrawnAmountFromTx() - No matching event found in transaction receipt log, skipping log.');
    }
  });

  return withdrawnAmount;
}
