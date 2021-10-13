import { FC, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@material-ui/core';
import { Context } from '../../../context';
import Typography from '../../typography/Typography';
import getNotificationService from '../../../services/getNotificationService';
import { generateEtherscanLink } from '../../../services/NotificationService';

interface ExecuteButtonProps {
  disabled: boolean;
  actionName: string;
  notificationText: string;
  onExecute: () => Promise<ethers.ContractTransaction | undefined>;
}

const ExecuteButton: FC<ExecuteButtonProps> = props => {
  const { disabled, actionName, notificationText, onExecute } = props;

  const { setData } = useContext(Context);

  const [executeInProgress, setExecuteInProgress] = useState<boolean>(false);

  const execute = () => {
    const runExecute = async () => {
      if (!setData) {
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
        getNotificationService().warn(`${actionName} Failed`, notificationText);
        setExecuteInProgress(false);
        return;
      }

      if (!transaction) {
        setExecuteInProgress(false);
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

      try {
        // Wait for transaction to finish
        await transaction.wait();
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
          notificationText,
          generateEtherscanLink(transaction.hash),
          'View on Etherscan',
        );
        setExecuteInProgress(false);
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
        notificationText,
        generateEtherscanLink(transaction.hash),
        'View on Etherscan',
      );
      setExecuteInProgress(false);
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
