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
    type: 'dark',
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
  },
  typography: {
    fontFamily: 'Aeonik',
  },
  overrides: {
    MuiSelect: {
      select: {
        padding: '5px 0',
      },
    },
    MuiDialog: {
      paperWidthSm: {
        minWidth: 400,
        maxWidth: 1000,
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
