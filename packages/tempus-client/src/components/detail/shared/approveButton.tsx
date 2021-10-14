import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';
import getNotificationService from '../../../services/getNotificationService';
import { generateEtherscanLink, getTokenApprovalNotification } from '../../../services/NotificationService';
import { Ticker } from '../../../interfaces';
import { Context } from '../../../context';
import Spacer from '../../spacer/spacer';

interface ApproveButtonProps {
  poolDataAdapter: PoolDataAdapter | null;
  tokenToApproveAddress: string | null;
  tokenToApproveTicker: Ticker | null;
  amountToApprove: BigNumber | null;
  spenderAddress: string;
  marginRight?: number;
  disabled?: boolean;
  onApproveChange: (approved: boolean) => void;
}

/**
 * @description Approve button component used for token approvals across the app.
 * @param poolDataAdapter Used for fetching current token allowance.
 * @param tokenToApproveAddress Contract address of the token we want to approve.
 * @param tokenToApproveTicker Ticker of the token we want to approve.
 * @param amountToApprove Amount of tokens to approve.
 * @param spenderAddress Address of the contract that will be spending approved tokens.
 * @param marginRight If present, specified margin right will be set on approve button.
 * @param disabled Disabled the approve button, approve button disabled conditions are:
 * 1. If amount of user entered token amount is missing or equals zero.
 * @param onApproveChange Called every time approve state changes, if user approved tokens or
 * allowance already exceeds amount to approve it will be called with true as argument. If
 * user did not approve tokens or if current allowance does not exceed amount to approve, it
 * will be called with false as argument.
 */
const ApproveButton: FC<ApproveButtonProps> = props => {
  const {
    poolDataAdapter,
    tokenToApproveAddress,
    tokenToApproveTicker,
    amountToApprove,
    spenderAddress,
    marginRight,
    disabled,
    onApproveChange,
  } = props;

  const { data, setData } = useContext(Context);

  const [approveInProgress, setApproveInProgress] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<BigNumber | null>(null);

  /**
   * Called when user clicks on the approve button.
   */
  const onApprove = useCallback(() => {
    const approve = async () => {
      if (!data.userWalletSigner || !poolDataAdapter || !amountToApprove || !setData || !tokenToApproveAddress) {
        return;
      }
      setApproveInProgress(true);

      let transaction: ethers.ContractTransaction | void;
      try {
        transaction = await poolDataAdapter.approveToken(
          tokenToApproveAddress,
          spenderAddress,
          amountToApprove,
          data.userWalletSigner,
        );
      } catch (error) {
        console.error(`Failed to create approve transaction for ${tokenToApproveTicker} token!`, error);

        if (tokenToApproveTicker && data.selectedRow) {
          getNotificationService().warn(
            `Approval Failed`,
            getTokenApprovalNotification(
              tokenToApproveTicker,
              data.selectedRow.backingTokenTicker,
              data.selectedRow.protocol,
              data.selectedRow.maturityDate,
            ),
          );
        }
        setApproveInProgress(false);
        return;
      }

      if (!transaction) {
        setApproveInProgress(false);
        return;
      }

      // Add approve transaction to the list of pending transactions
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
        console.error(`Failed to execute approve transaction for ${tokenToApproveTicker} token!`, error);

        // Remove approve transaction from list of pending transactions when transaction fails.
        setData(previousData => {
          const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
            return pendingTransaction !== transaction?.hash;
          });
          return {
            ...previousData,
            pendingTransactions: filteredTransactions,
          };
        });

        // Show transaction failed notification.
        if (tokenToApproveTicker && data.selectedRow) {
          getNotificationService().warn(
            `Approval Failed`,
            getTokenApprovalNotification(
              tokenToApproveTicker,
              data.selectedRow.backingTokenTicker,
              data.selectedRow.protocol,
              data.selectedRow.maturityDate,
            ),
            generateEtherscanLink(transaction.hash),
            'View on Etherscan',
          );
        }

        setApproveInProgress(false);
        return;
      }

      // Remove approve transaction from list of pending transactions when transaction succeeds.
      setData(previousData => {
        const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
          return pendingTransaction !== transaction?.hash;
        });
        return {
          ...previousData,
          pendingTransactions: filteredTransactions,
        };
      });

      // Show approve transaction completed notification
      if (tokenToApproveTicker && data.selectedRow) {
        getNotificationService().notify(
          'Approval Successful',
          getTokenApprovalNotification(
            tokenToApproveTicker,
            data.selectedRow.backingTokenTicker,
            data.selectedRow.protocol,
            data.selectedRow.maturityDate,
          ),
          generateEtherscanLink(transaction.hash),
          'View on Etherscan',
        );
      }

      // After approve completes, we need to set new allowance value
      setAllowance(
        await poolDataAdapter.getTokenAllowance(
          tokenToApproveAddress,
          spenderAddress,
          data.userWalletAddress,
          data.userWalletSigner,
        ),
      );

      setApproveInProgress(false);
    };
    approve();
  }, [
    poolDataAdapter,
    data.userWalletSigner,
    data.selectedRow,
    data.userWalletAddress,
    tokenToApproveAddress,
    tokenToApproveTicker,
    spenderAddress,
    amountToApprove,
    setData,
  ]);

  // Fetch current token allowance from contract
  useEffect(() => {
    const getAllowance = async () => {
      if (!poolDataAdapter || !data.userWalletSigner || !tokenToApproveAddress) {
        return;
      }

      setAllowance(
        await poolDataAdapter.getTokenAllowance(
          tokenToApproveAddress,
          spenderAddress,
          data.userWalletAddress,
          data.userWalletSigner,
        ),
      );
    };
    getAllowance();
  }, [poolDataAdapter, data.userWalletSigner, spenderAddress, tokenToApproveAddress, data.userWalletAddress]);

  /**
   * Checks if tokens are approved.
   * If current allowance exceeds amount to approve, user does not have to approve tokens again.
   */
  const approved = useMemo(() => {
    if (!amountToApprove) {
      return false;
    }

    if (amountToApprove.isZero()) {
      return true;
    }

    const alreadyApproved = allowance && allowance.gte(amountToApprove);

    return alreadyApproved;
  }, [allowance, amountToApprove]);

  if (approved) {
    onApproveChange(true);
  } else {
    onApproveChange(false);
  }

  // In case of ETH we don't want to show Approve button at all
  if (tokenToApproveTicker === 'ETH') {
    return null;
  }

  // Do not show approve button if amount to approve is zero
  if (amountToApprove && amountToApprove.isZero()) {
    return null;
  }

  return (
    <>
      {/* Show Approve button if tokens are not approved already */}
      {!approved && (
        <Button
          color="primary"
          variant="contained"
          onClick={onApprove}
          disabled={disabled || approveInProgress || !tokenToApproveAddress}
        >
          <Typography variant="h5" color="inverted">
            Approve
          </Typography>
        </Button>
      )}

      {/* Show Approved label if tokens are approved */}
      {approved && <Typography variant="h5">Approved</Typography>}

      {/* Set margin right if specified */}
      {marginRight && <Spacer size={marginRight} />}
    </>
  );
};
export default ApproveButton;
