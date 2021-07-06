import WalletConnect from '../wallet-connect/wallet-connect';

import './header.scss';

function Header(): JSX.Element {
  return (
    <div className='header-container'>
      <img alt='tempus-logo' src='/tempus-logo.svg' />
      <div className='header-actions'>
        <p className='header-action'>
          EARN
        </p>
        <p className='header-action'>
          FIX
        </p>
        <p className='header-action'>
          TRADE
        </p>
        <WalletConnect />
      </div>
    </div>
  );
}
export default Header;
