import { FC, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@material-ui/core';
import { Context } from '../../../context';
import getNotificationService from '../../../services/getNotificationService';
import {
  generateEtherscanLink,
  generateNotificationInfo,
  generatePoolNotificationInfo,
} from '../../../services/NotificationService';
import { TempusPool } from '../../../interfaces/TempusPool';
import Typography from '../../typography/Typography';

interface ExecuteButtonProps {
  disabled: boolean;
  actionName: string;
  actionDescription?: string;
  tempusPool: TempusPool;
  onExecute: () => Promise<ethers.ContractTransaction | undefined>;
  onExecuted: (successful: boolean) => void;
}

const ExecuteButton: FC<ExecuteButtonProps> = props => {
  const { disabled, actionName, actionDescription, tempusPool, onExecute, onExecuted } = props;

  const { data, setData } = useContext(Context);

  const [executeInProgress, setExecuteInProgress] = useState<boolean>(false);

  const execute = () => {
    const runExecute = async () => {
      if (!setData || !data.selectedRow) {
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
            data.selectedRow.backingTokenTicker,
            data.selectedRow.protocol,
            data.selectedRow.maturityDate,
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
      setData(previousData => {
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
        setData(previousData => {
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
            data.selectedRow.backingTokenTicker,
            data.selectedRow.protocol,
            data.selectedRow.maturityDate,
          ),
          generateEtherscanLink(transaction.hash),
          'View on Etherscan',
        );
        setExecuteInProgress(false);
        onExecuted(false);
        return;
      }

      // Remove transaction from pending transactions if it succeeded.
      setData(previousData => {
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
          data.userWalletAddress,
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
      variant="contained"
      color="secondary"
      size="large"
      disabled={disabled || executeInProgress}
      onClick={execute}
    >
      <Typography variant="h5" color="inverted">
        Execute
      </Typography>
    </Button>
  );
};
export default ExecuteButton;
