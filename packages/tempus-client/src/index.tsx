import React from 'react';
import ReactDOM from 'react-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import App from './components/app/App';
import getLibrary from './utils/getLibrary';

import './index.scss';

// Use theme object to modify colors, fonts, etc...
const theme = createTheme({
  palette: {
    type: 'light',
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '0.875rem',
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
