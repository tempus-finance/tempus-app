import React from 'react';
import ReactDOM from 'react-dom';
import { Web3ReactProvider } from '@web3-react/core';
import isMobile from 'is-mobile';
import MobileBanner from './components/mobileBanner/MobileBanner';
import App from './components/app/App';
import getLibrary from './utils/getLibrary';

import './index.scss';

const mobile = isMobile();

try {
  const release = require('./release.json');
  console.log(`Current version: ${release.releaseVersion}`);
} catch (e) {}

if (mobile) {
  ReactDOM.render(
    <React.StrictMode>
      <MobileBanner />
    </React.StrictMode>,
    document.getElementById('root'),
  );
} else {
  ReactDOM.render(
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
}
