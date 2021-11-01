import React, { Dispatch, SetStateAction } from 'react';

interface ContextData {
  pendingTransactions: string[];
}

interface ContextActions {
  setPendingTransactions: Dispatch<SetStateAction<ContextData>> | null;
}

interface ContextType extends ContextActions, ContextData {}

export const defaultPendingTransactionsContextValue: ContextData = {
  pendingTransactions: [],
};

export const PendingTransactionsContext = React.createContext<ContextType>({
  ...defaultPendingTransactionsContextValue,
  setPendingTransactions: null,
});
