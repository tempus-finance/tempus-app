import React, { Dispatch, SetStateAction } from 'react';
import { PendingTransaction } from '../interfaces/PendingTransaction';

interface PendingTransactionsContextData {
  pendingTransactions: PendingTransaction[];
}

interface PendingTransactionsContextActions {
  setPendingTransactions: Dispatch<SetStateAction<PendingTransactionsContextData>> | null;
}

interface PendingTransactionsContextType extends PendingTransactionsContextActions, PendingTransactionsContextData {}

export const defaultPendingTransactionsContextValue: PendingTransactionsContextData = {
  pendingTransactions: [],
};

export const PendingTransactionsContext = React.createContext<PendingTransactionsContextType>({
  ...defaultPendingTransactionsContextValue,
  setPendingTransactions: null,
});
