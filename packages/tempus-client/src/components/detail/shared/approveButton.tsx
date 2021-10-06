import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';
import getNotificationService from '../../../services/getNotificationService';
import { generateEtherscanLink, getTokenApprovalNotification } from '../../../services/NotificationService';
import { Ticker } from '../../../interfaces';
import { Context } from '../../../context';

interface ApproveButtonProps {
  poolDataAdapter: PoolDataAdapter | null;
  tokenToApprove: string;
  spenderAddress: string;
  amountToApprove: BigNumber | null;
  tokenTicker: Ticker | null;
  onApproved: () => void;
  onAllowanceExceeded?: () => void;
}

const ApproveButton: FC<ApproveButtonProps> = props => {
  const {
    poolDataAdapter,
    tokenToApprove,
    spenderAddress,
    amountToApprove,
    tokenTicker,
    onApproved,
    onAllowanceExceeded,
  } = props;

  const { data, setData } = useContext(Context);

  const [approving, setApproving] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<number | null>(null);

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (!data.userWalletSigner || !poolDataAdapter || !amountToApprove || !setData) {
        return;
      }

      let transaction: ethers.ContractTransaction | undefined | void;
      try {
        transaction = await poolDataAdapter.approveToken(
          tokenToApprove,
          spenderAddress,
          amountToApprove,
          data.userWalletSigner,
        );
      } catch (error) {
        console.error('Failed to execute the transaction!', error);

        if (tokenTicker && data.selectedRow) {
          getNotificationService().warn(
            `Approval Failed`,
            getTokenApprovalNotification(
              tokenTicker,
              data.selectedRow.backingTokenTicker,
              data.selectedRow.protocol,
              data.selectedRow.maturityDate,
            ),
          );
        }
        setApproving(false);
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
        if (tokenTicker && data.selectedRow) {
          getNotificationService().warn(
            `Approval Failed`,
            getTokenApprovalNotification(
              tokenTicker,
              data.selectedRow.backingTokenTicker,
              data.selectedRow.protocol,
              data.selectedRow.maturityDate,
            ),
            generateEtherscanLink(transaction.hash),
            'View on Etherscan',
          );
        }
        setApproving(false);
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

      if (tokenTicker && data.selectedRow) {
        getNotificationService().notify(
          'Approval Successful',
          getTokenApprovalNotification(
            tokenTicker,
            data.selectedRow.backingTokenTicker,
            data.selectedRow.protocol,
            data.selectedRow.maturityDate,
          ),
          generateEtherscanLink(transaction.hash),
          'View on Etherscan',
        );
      }

      // Set new allowance
      setAllowance(
        await poolDataAdapter.getTokenAllowance(
          tokenToApprove,
          spenderAddress,
          data.userWalletAddress,
          data.userWalletSigner,
        ),
      );

      onApproved();
      setApproving(false);
    };
    approve();
    setApproving(true);
  }, [
    data.userWalletSigner,
    poolDataAdapter,
    amountToApprove,
    setData,
    tokenTicker,
    data.selectedRow,
    tokenToApprove,
    spenderAddress,
    data.userWalletAddress,
    onApproved,
  ]);

  // Fetch token allowance
  useEffect(() => {
    const getAllowance = async () => {
      if (!poolDataAdapter || !data.userWalletSigner || !tokenToApprove) {
        return;
      }

      setAllowance(
        await poolDataAdapter.getTokenAllowance(
          tokenToApprove,
          spenderAddress,
          data.userWalletAddress,
          data.userWalletSigner,
        ),
      );
    };
    getAllowance();
  }, [poolDataAdapter, data.userWalletSigner, spenderAddress, tokenToApprove, data.userWalletAddress]);

  const approved = useMemo(() => {
    if (!amountToApprove) {
      return false;
    }

    if (amountToApprove.isZero()) {
      return true;
    }

    const amountToApproveParsed = Number(ethers.utils.formatEther(amountToApprove));

    const alreadyApproved = !!allowance && allowance >= amountToApproveParsed;

    return alreadyApproved;
  }, [allowance, amountToApprove]);

  if (approved) {
    onApproved();
  } else {
    onAllowanceExceeded && onAllowanceExceeded();
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
