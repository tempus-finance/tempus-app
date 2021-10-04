import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';
import getNotificationService from '../../../services/getNotificationService';
import { Ticker } from '../../../interfaces';
import { Context } from '../../../context';

interface ApproveButtonProps {
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
  tokenToApprove: string;
  spenderAddress: string;
  amountToApprove: BigNumber | null;
  tokenTicker: Ticker | null;
  onApproved: () => void;
}

const ApproveButton: FC<ApproveButtonProps> = props => {
  const {
    signer,
    poolDataAdapter,
    tokenToApprove,
    spenderAddress,
    userWalletAddress,
    amountToApprove,
    tokenTicker,
    onApproved,
  } = props;

  const { setData } = useContext(Context);

  const [approving, setApproving] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<number | null>(null);

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (!signer || !poolDataAdapter || !amountToApprove || !setData) {
        return;
      }

      let transaction: ethers.ContractTransaction | undefined | void;
      try {
        transaction = await poolDataAdapter.approveToken(tokenToApprove, spenderAddress, amountToApprove, signer);
      } catch (error) {
        console.error('Failed to execute the transaction!', error);
        getNotificationService().warn(`Token approval failed!`, `Token approval failed failed!`);
        return;
      }

      if (!transaction) {
        return;
      }

      setData(previousData => {
        if (!transaction) {
          return previousData;
        }
        return {
          ...previousData,
          pendingTransactions: [...previousData.pendingTransactions, transaction.hash],
        };
      });

      try {
        await transaction.wait();
      } catch (error) {
        console.error('Transaction failed to execute!', error);
        setData(previousData => {
          const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
            return pendingTransaction !== transaction?.hash;
          });
          return {
            ...previousData,
            pendingTransactions: filteredTransactions,
          };
        });
        getNotificationService().warn(`Token approval failed!`, `Token approval failed failed!`);
        return;
      }

      setData(previousData => {
        const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
          return pendingTransaction !== transaction?.hash;
        });
        return {
          ...previousData,
          pendingTransactions: filteredTransactions,
        };
      });

      getNotificationService().notify('Token Approval successful', `Successfully approved ${tokenTicker}!`);

      // Set new allowance
      setAllowance(await poolDataAdapter.getTokenAllowance(tokenToApprove, spenderAddress, userWalletAddress, signer));

      onApproved();
      setApproving(false);
    };
    approve();
    setApproving(true);
  }, [
    signer,
    poolDataAdapter,
    amountToApprove,
    setData,
    tokenToApprove,
    spenderAddress,
    tokenTicker,
    userWalletAddress,
    onApproved,
  ]);

  // Fetch token allowance
  useEffect(() => {
    const getAllowance = async () => {
      if (!poolDataAdapter || !signer || !tokenToApprove) {
        return;
      }

      setAllowance(await poolDataAdapter.getTokenAllowance(tokenToApprove, spenderAddress, userWalletAddress, signer));
    };
    getAllowance();
  }, [poolDataAdapter, signer, spenderAddress, tokenToApprove, userWalletAddress]);

  const approved = useMemo(() => {
    if (!amountToApprove) {
      return false;
    }

    const amountToApproveParsed = Number(ethers.utils.formatEther(amountToApprove));

    const alreadyApproved = !!allowance && allowance >= amountToApproveParsed;

    return alreadyApproved;
  }, [allowance, amountToApprove]);

  if (approved) {
    onApproved();
  }

  return (
    <>
      {/* Show Approve button if tokens are not approved already */}
      {!approved && (
        <Button color="primary" variant="contained" onClick={onApprove} disabled={approving || !tokenToApprove}>
          <Typography variant="h5" color="inverted">
            Approve
          </Typography>
        </Button>
      )}

      {/* Show Approved label if tokens are approved */}
      {approved && <Typography variant="h5">Approved</Typography>}
    </>
  );
};
export default ApproveButton;
