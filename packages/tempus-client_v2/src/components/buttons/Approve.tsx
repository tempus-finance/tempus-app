import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../adapters/PoolDataAdapter';
import Typography from '../typography/Typography';
import getNotificationService from '../../services/getNotificationService';
import { generateEtherscanLink, getTokenApprovalNotification } from '../../services/NotificationService';
import { Ticker } from '../../interfaces/Token';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { LanguageContext } from '../../context/languageContext';
import { WalletContext } from '../../context/walletContext';
import getText from '../../localisation/getText';
import Spacer from '../spacer/spacer';

import './Approve.scss';

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

  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { setPendingTransactions } = useContext(PendingTransactionsContext);
  const { userWalletAddress, userWalletSigner } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);

  const [approveInProgress, setApproveInProgress] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<BigNumber | null>(null);

  const selectedPoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  /**
   * Called when user clicks on the approve button.
   */
  const onApprove = useCallback(() => {
    const approve = async () => {
      if (
        !userWalletSigner ||
        !poolDataAdapter ||
        !amountToApprove ||
        !setPendingTransactions ||
        !tokenToApproveAddress
      ) {
        return;
      }
      setApproveInProgress(true);

      let transaction: ethers.ContractTransaction | void;
      try {
        transaction = await poolDataAdapter.approveToken(
          tokenToApproveAddress,
          spenderAddress,
          amountToApprove,
          userWalletSigner,
        );
      } catch (error) {
        console.error(`Failed to create approve transaction for ${tokenToApproveTicker} token!`, error);

        if (tokenToApproveTicker && selectedPoolData) {
          getNotificationService().warn(
            `Approval Failed`,
            getTokenApprovalNotification(
              tokenToApproveTicker,
              selectedPoolData.backingToken,
              selectedPoolData.protocol,
              new Date(selectedPoolData.maturityDate),
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
      setPendingTransactions(previousData => {
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
        setPendingTransactions(previousData => {
          const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
            return pendingTransaction !== transaction?.hash;
          });
          return {
            ...previousData,
            pendingTransactions: filteredTransactions,
          };
        });

        // Show transaction failed notification.
        if (tokenToApproveTicker && selectedPoolData) {
          getNotificationService().warn(
            `Approval Failed`,
            getTokenApprovalNotification(
              tokenToApproveTicker,
              selectedPoolData.backingToken,
              selectedPoolData.protocol,
              new Date(selectedPoolData.maturityDate),
            ),
            generateEtherscanLink(transaction.hash),
            'View on Etherscan',
          );
        }

        setApproveInProgress(false);
        return;
      }

      // Remove approve transaction from list of pending transactions when transaction succeeds.
      setPendingTransactions(previousData => {
        const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
          return pendingTransaction !== transaction?.hash;
        });
        return {
          ...previousData,
          pendingTransactions: filteredTransactions,
        };
      });

      // Show approve transaction completed notification
      if (tokenToApproveTicker && selectedPoolData) {
        getNotificationService().notify(
          'Approval Successful',
          getTokenApprovalNotification(
            tokenToApproveTicker,
            selectedPoolData.backingToken,
            selectedPoolData.protocol,
            new Date(selectedPoolData.maturityDate),
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
          userWalletAddress,
          userWalletSigner,
        ),
      );

      setApproveInProgress(false);
    };
    approve();
  }, [
    poolDataAdapter,
    userWalletSigner,
    userWalletAddress,
    selectedPoolData,
    tokenToApproveAddress,
    tokenToApproveTicker,
    spenderAddress,
    amountToApprove,
    setPendingTransactions,
  ]);

  // Fetch current token allowance from contract
  useEffect(() => {
    const getAllowance = async () => {
      if (!poolDataAdapter || !userWalletSigner || !tokenToApproveAddress) {
        return;
      }

      setAllowance(
        await poolDataAdapter.getTokenAllowance(
          tokenToApproveAddress,
          spenderAddress,
          userWalletAddress,
          userWalletSigner,
        ),
      );
    };
    getAllowance();
  }, [poolDataAdapter, userWalletSigner, spenderAddress, tokenToApproveAddress, userWalletAddress]);

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

  useEffect(() => {
    if (approved) {
      onApproveChange(true);
    } else {
      onApproveChange(false);
    }
  }, [approved, onApproveChange]);

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
          className="tc__approve-button"
        >
          <Typography variant="button-text" color="inverted">
            {getText('approve', language)}
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
