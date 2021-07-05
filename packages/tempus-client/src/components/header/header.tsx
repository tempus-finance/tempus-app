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
        <p className='header-action'>
          CONNECT WALLET
        </p>
      </div>
    </div>
  );
}
export default Header;
