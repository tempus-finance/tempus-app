import React from 'react';
import ReactDOM from 'react-dom';
import { Web3ReactProvider } from '@web3-react/core';
import App from './components/app/App';
import getLibrary from './utils/getLibrary';
import PoolShareBalanceProvider from './providers/poolShareBalanceProvider';

import './index.scss';

const poolShareBalanceProvider = new PoolShareBalanceProvider();
poolShareBalanceProvider.init();

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
