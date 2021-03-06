import { FC, useContext, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { ethers } from 'ethers';
import { Button, CircularProgress } from '@material-ui/core';
import { Chain } from 'tempus-core-services';
import { selectedPoolState, staticPoolDataState } from '../../state/PoolDataState';
import { staticChainDataState } from '../../state/ChainState';
import getNotificationService from '../../services/getNotificationService';
import {
  generateEtherscanLink,
  generateFailedTransactionInfo,
  generateNotificationInfo,
  generatePoolNotificationInfo,
} from '../../services/notificationFormatters';
import Typography from '../typography/Typography';
import getText from '../../localisation/getText';
import { PendingTransactionsContext } from '../../context/pendingTransactionsContext';
import { WalletContext } from '../../context/walletContext';
import { LocaleContext } from '../../context/localeContext';

import './Execute.scss';

interface ExecuteButtonProps {
  disabled: boolean;
  executeDisabledText?: string;
  actionName: string;
  chain: Chain;
  actionDescription?: string;
  onExecute: () => Promise<ethers.ContractTransaction | undefined>;
  onExecuted: (successful: boolean, txBlockNumber?: number) => void;
}

const Execute: FC<ExecuteButtonProps> = props => {
  const { disabled, executeDisabledText, actionName, actionDescription, chain, onExecute, onExecuted } = props;

  const selectedPool = useHookState(selectedPoolState);
  const staticPoolData = useHookState(staticPoolDataState);
  const staticChainData = useHookState(staticChainDataState);

  const { setPendingTransactions } = useContext(PendingTransactionsContext);
  const { locale } = useContext(LocaleContext);
  const { userWalletAddress } = useContext(WalletContext);

  const [executeInProgress, setExecuteInProgress] = useState<boolean>(false);

  const blockExplorerName = staticChainData[chain].blockExplorerName.attach(Downgraded).get();
  const selectedPoolData = staticPoolData[selectedPool.get()].attach(Downgraded).get();
  const backingToken = staticPoolData[selectedPool.get()].backingToken.attach(Downgraded).get();
  const protocol = staticPoolData[selectedPool.get()].protocol.attach(Downgraded).get();
  const maturityDate = staticPoolData[selectedPool.get()].maturityDate.attach(Downgraded).get();

  const viewLinkText = `${getText('viewOnXxx', locale, { name: blockExplorerName })}`;

  const execute = () => {
    const runExecute = async () => {
      if (!setPendingTransactions) {
        return;
      }
      setExecuteInProgress(true);

      const content = generatePoolNotificationInfo(chain, locale, backingToken, protocol, new Date(maturityDate));

      let transaction: ethers.ContractTransaction | undefined;
      try {
        // Execute transaction
        transaction = await onExecute();
      } catch (error) {
        console.error('Failed to execute transaction!', error);

        if ((error as any).code === 4001) {
          // Notify user about declined action.
          getNotificationService().warn(
            chain,
            'Transaction',
            getText('xxxDeclined', locale, { action: actionName }),
            getText('xxxDeclinedMessage', locale, { action: actionName }),
          );
        } else {
          // Notify user about failed action.
          getNotificationService().warn(
            chain,
            'Transaction',
            getText('xxxFailed', locale, { action: actionName }),
            generateFailedTransactionInfo(chain, locale, selectedPoolData, error),
          );
        }
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
              link: generateEtherscanLink(transaction.hash, chain),
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
          chain,
          'Transaction',
          `${actionName} Failed`,
          generateFailedTransactionInfo(chain, locale, selectedPoolData, error),
          generateEtherscanLink(transaction.hash, chain),
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
        chain,
        'Transaction',
        `${actionName} Successful`,
        `${generateNotificationInfo(
          chain,
          locale,
          actionName,
          actionDescription || '',
          confirmations,
          transaction,
          userWalletAddress,
          selectedPoolData,
        )}`,
        generateEtherscanLink(transaction.hash, chain),
        viewLinkText,
      );
      setExecuteInProgress(false);
      onExecuted(true, confirmations.blockNumber);
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
            <CircularProgress size={16} color="inherit" /> {getText('executing', locale)}
          </>
        )}

        {!executeInProgress && !disabled && getText('execute', locale)}

        {!executeInProgress && disabled && (executeDisabledText || getText('execute', locale))}
      </Typography>
    </Button>
  );
};
export default Execute;
