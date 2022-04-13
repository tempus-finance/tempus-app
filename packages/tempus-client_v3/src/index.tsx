import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import isMobile from 'is-mobile';
import reportWebVitals from './reportWebVitals';
import release from './release.json';
import App from './components/App/App';

// Creates CSS variables for all color constants
import './components/shared/Colors';

// Creates CSS variables for all shadow constants
import './components/shared/Shadow';

import './index.scss';

const mobile = isMobile();

try {
  console.log(`Current version: ${release.releaseVersion}`);
} catch (e) {
  console.error(e);
}

if (mobile) {
  ReactDOM.render(
    <React.StrictMode>
      <div>Mobile not supported</div>
    </React.StrictMode>,
    document.getElementById('root'),
  );
} else {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
