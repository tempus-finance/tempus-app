import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Web3ReactProvider } from '@web3-react/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import App from './components/app/App';
import getLibrary from './utils/getLibrary';
import { store } from './state/store';

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
    fontFamily: 'Aeonik, sans-serif',
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
    MuiTooltip: {
      tooltip: {
        fontSize: '0.875rem',
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <App />
        </Web3ReactProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
