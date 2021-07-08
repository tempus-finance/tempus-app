import WalletConnect from '../wallet-connect/wallet-connect';

import { Typography } from '@material-ui/core';

import './header.scss';

function Header(): JSX.Element {
  return (
    <div className="header-container">
      <img alt="tempus-logo" src="/tempus-logo.svg" />
      <div className="header-actions">
        <Typography className="header-action" variant="button">
          EARN
        </Typography>
        <Typography className="header-action" variant="button">
          FIX
        </Typography>
        <Typography className="header-action" variant="button">
          TRADE
        </Typography>
        <WalletConnect />
      </div>
    </div>
  );
}
export default Header;
