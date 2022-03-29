import React from 'react';
import ReactDOM from 'react-dom';
import { getLibrary } from 'tempus-core-services';
import { Web3ReactProvider } from '@web3-react/core';
import isMobile from 'is-mobile';
import MobileBanner from './components/mobileBanner/MobileBanner';
import App from './components/app/App';
import reportWebVitals from './reportWebVitals';

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
