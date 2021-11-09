import React, { Dispatch, SetStateAction } from 'react';

interface PendingTransactionsContextData {
  pendingTransactions: string[];
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
