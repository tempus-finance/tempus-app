import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import getDefaultProvider from '../services/getDefaultProvider';
import TransactionsDataAdapter from './TransactionsDataAdapter';

let transactionsDataAdapter: TransactionsDataAdapter;
const getTransactionsDataAdapter = (signerOrProvider?: JsonRpcSigner | JsonRpcProvider): TransactionsDataAdapter => {
  if (!transactionsDataAdapter) {
    transactionsDataAdapter = new TransactionsDataAdapter();
    transactionsDataAdapter.init({
      signerOrProvider: getDefaultProvider(),
    });
  }

  if (signerOrProvider) {
    transactionsDataAdapter.init({
      signerOrProvider: signerOrProvider,
    });
  }

  return transactionsDataAdapter;
};

export default getTransactionsDataAdapter;
