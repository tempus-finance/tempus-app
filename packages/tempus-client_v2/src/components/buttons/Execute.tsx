import { FC, useContext, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers } from 'ethers';
import { Button, CircularProgress } from '@material-ui/core';
import { selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { selectedChainState, staticChainDataState } from '../../state/ChainState';
import getNotificationService from '../../services/getNotificationService';
import {
  generateEtherscanLink,
  generateNotificationInfo,
  generatePoolNotificationInfo,
} from '../../services/NotificationService';
import Typography from '../typography/Typography';
import getText from '../../localisation/getText';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { WalletContext } from '../../context/walletContext';
import { LanguageContext } from '../../context/languageContext';

import './Execute.scss';

interface ExecuteButtonProps {
  disabled: boolean;
  executeDisabledText?: string;
  actionName: string;
  actionDescription?: string;
  onExecute: () => Promise<ethers.ContractTransaction | undefined>;
  onExecuted: (successful: boolean) => void;
}

const Execute: FC<ExecuteButtonProps> = props => {
  const { disabled, executeDisabledText, actionName, actionDescription, onExecute, onExecuted } = props;

  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const selectedChain = useHookState(selectedChainState);
  const staticChainData = useHookState(staticChainDataState);

  const { setPendingTransactions } = useContext(PendingTransactionsContext);
  const { language } = useContext(LanguageContext);
  const { userWalletAddress } = useContext(WalletContext);

  const [executeInProgress, setExecuteInProgress] = useState<boolean>(false);

  const selectedChainName = selectedChain.attach(Downgraded).get();
  const blockExplorerName = staticChainData[selectedChainName].blockExplorerName.attach(Downgraded).get();
  const selectedPoolData = staticPoolData[selectedPool.get()].attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const protocol = staticPoolData[selectedPool.get()].protocol.attach(Downgraded).get();
  const maturityDate = staticPoolData[selectedPool.get()].maturityDate.attach(Downgraded).get();

  const viewLinkText = `${getText('viewOn', language)} ${blockExplorerName}`;

  const execute = () => {
    const runExecute = async () => {
      if (!setPendingTransactions) {
        return;
      }
      setExecuteInProgress(true);

      const content = generatePoolNotificationInfo(backingToken, protocol, new Date(maturityDate));

      let transaction: ethers.ContractTransaction | undefined;
      try {
        // Execute transaction
        transaction = await onExecute();
      } catch (error) {
        console.error('Failed to execute transaction!', error);
        // Notify user about failed action.
        getNotificationService().warn('Transaction', `${actionName} Failed`, content);
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
          pendingTransactions: [
            ...previousData.pendingTransactions,
            {
              ...transaction,
              title: `Executing ${actionName}`,
              content,
              link: generateEtherscanLink(transaction.hash, selectedChainName),
              linkText: viewLinkText,
            },
          ],
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
          const filteredTransactions = previousData.pendingTransactions.filter(
            ({ hash }) => hash !== transaction?.hash,
          );
          return {
            ...previousData,
            pendingTransactions: filteredTransactions,
          };
        });

        // Notify user about failed action.
        getNotificationService().warn(
          'Transaction',
          `${actionName} Failed`,
          content,
          generateEtherscanLink(transaction.hash, selectedChainName),
          viewLinkText,
        );
        setExecuteInProgress(false);
        onExecuted(false);
        return;
      }

      // Remove transaction from pending transactions if it succeeded.
      setPendingTransactions(previousData => {
        const filteredTransactions = previousData.pendingTransactions.filter(({ hash }) => hash !== transaction?.hash);
        return {
          ...previousData,
          pendingTransactions: filteredTransactions,
        };
      });

      // Notify user about successful action.
      getNotificationService().notify(
        'Transaction',
        `${actionName} Successful`,
        `${generateNotificationInfo(
          actionName,
          actionDescription || '',
          confirmations,
          transaction,
          userWalletAddress,
          selectedPoolData,
        )}`,
        generateEtherscanLink(transaction.hash, selectedChainName),
        viewLinkText,
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
      className={`tc__execute-button ${executeInProgress && 'tc__execute-button__pending'}`}
    >
      <Typography variant="button-text" color="inverted">
        {executeInProgress && (
          <>
            <CircularProgress size={16} color="inherit" /> {getText('executing', language)}
          </>
        )}

        {!executeInProgress && !disabled && getText('execute', language)}

        {!executeInProgress && disabled && (executeDisabledText || getText('execute', language))}
      </Typography>
    </Button>
  );
};
export default Execute;
