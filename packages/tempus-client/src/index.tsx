import React from 'react';
import ReactDOM from 'react-dom';
import { Web3ReactProvider } from '@web3-react/core';

import { createTheme, ThemeProvider } from '@material-ui/core';

import App from './components/app/App';

import getLibrary from './util/get-library';

import './index.scss';

// Use theme object to modify colors, fonts, etc...
const theme = createTheme({
  palette: {
    primary: {
      main: '#066d59',
      dark: '#066d59',
      light: 'ffdf99',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ada4fd',
      contrastText: '#ffffff',
    },
    divider: '#ffffff',
  },
  typography: {
    fontFamily: 'Aeonik',
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
