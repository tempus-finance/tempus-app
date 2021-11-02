import { FC, useContext, useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { Button } from '@material-ui/core';
import getNotificationService from '../../services/getNotificationService';
import {
  generateEtherscanLink,
  generateNotificationInfo,
  generatePoolNotificationInfo,
} from '../../services/NotificationService';
import { TempusPool } from '../../interfaces/TempusPool';
import Typography from '../typography/Typography';
import getText from '../../localisation/getText';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { PoolDataContext, getDataForPool } from '../../context/poolDataContext';
import { WalletContext } from '../../context/walletContext';
import { LanguageContext } from '../../context/languageContext';

import './Execute.scss';

interface ExecuteButtonProps {
  disabled: boolean;
  actionName: string;
  actionDescription?: string;
  tempusPool: TempusPool;
  onExecute: () => Promise<ethers.ContractTransaction | undefined>;
  onExecuted: (successful: boolean) => void;
}

const Execute: FC<ExecuteButtonProps> = props => {
  const { disabled, actionName, actionDescription, tempusPool, onExecute, onExecuted } = props;

  const { setPendingTransactions } = useContext(PendingTransactionsContext);
  const { poolData, selectedPool } = useContext(PoolDataContext);
  const { language } = useContext(LanguageContext);
  const { userWalletAddress } = useContext(WalletContext);

  const [executeInProgress, setExecuteInProgress] = useState<boolean>(false);

  const selectedPoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  const execute = () => {
    const runExecute = async () => {
      if (!setPendingTransactions || !selectedPoolData) {
        return;
      }
      setExecuteInProgress(true);

      let transaction: ethers.ContractTransaction | undefined;
      try {
        // Execute transaction
        transaction = await onExecute();
      } catch (error) {
        console.error('Failed to execute transaction!', error);
        // Notify user about failed action.
        getNotificationService().warn(
          `${actionName} Failed`,
          generatePoolNotificationInfo(
            selectedPoolData.backingTokenTicker,
            selectedPoolData.protocol,
            new Date(selectedPoolData.maturityDate),
          ),
        );
        setExecuteInProgress(false);
        onExecuted(false);
        return;
      }

      if (!transaction) {
        setExecuteInProgress(false);
        onExecuted(false);
        return;
      }

      // Increase number of pending transactions
      setPendingTransactions(previousData => {
        if (!transaction) {
          return previousData;
        }

        return {
          ...previousData,
          pendingTransactions: [...previousData.pendingTransactions, transaction.hash],
        };
      });
      let confirmations: ethers.ContractReceipt;
      try {
        // Wait for transaction to finish
        confirmations = await transaction.wait();
      } catch (error) {
        console.error('Transaction failed to execute!', error);
        // Remove transaction from pending transactions if it failed.
        setPendingTransactions(previousData => {
          const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
            return pendingTransaction !== transaction?.hash;
          });
          return {
            ...previousData,
            pendingTransactions: filteredTransactions,
          };
        });

        // Notify user about failed action.
        getNotificationService().warn(
          `${actionName} Failed`,
          generatePoolNotificationInfo(
            selectedPoolData.backingTokenTicker,
            selectedPoolData.protocol,
            new Date(selectedPoolData.maturityDate),
          ),
          generateEtherscanLink(transaction.hash),
          'View on Etherscan',
        );
        setExecuteInProgress(false);
        onExecuted(false);
        return;
      }

      // Remove transaction from pending transactions if it succeeded.
      setPendingTransactions(previousData => {
        const filteredTransactions = previousData.pendingTransactions.filter(pendingTransaction => {
          return pendingTransaction !== transaction?.hash;
        });
        return {
          ...previousData,
          pendingTransactions: filteredTransactions,
        };
      });

      // Notify user about successful action.
      getNotificationService().notify(
        `${actionName} Successful`,
        `${generateNotificationInfo(
          actionName,
          actionDescription || '',
          confirmations,
          transaction,
          userWalletAddress,
          tempusPool,
        )}`,
        generateEtherscanLink(transaction.hash),
        'View on Etherscan',
      );
      setExecuteInProgress(false);
      onExecuted(true);
    };
    runExecute();
  };

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={execute}
      disabled={disabled || executeInProgress}
      className="tc__execute-button"
    >
      <Typography variant="h5" color="inverted">
        {getText('execute', language)}
      </Typography>
    </Button>
  );
};
export default Execute;
