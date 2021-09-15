import { FC } from 'react';
import Button from '@material-ui/core/Button';
import WalletConnect from '../wallet-connect/wallet-connect';
import TempusLogo from './tempusLogo';

import './header.scss';

export type HeaderLinks = 'Dashboard' | 'Portfolio' | '';

type HeaderInProps = {
  active?: HeaderLinks;
};

type HeaderOutProps = {
  onDashboardClick?: () => void;
  onLogoClick: () => void;
};

type HeaderProps = HeaderInProps & HeaderOutProps;

const Header: FC<HeaderProps> = ({ active, onDashboardClick, onLogoClick }): JSX.Element => {
  return (
    <div className="tf__header__container">
      <div className="tf__logo">
        <TempusLogo onClick={onLogoClick} />
      </div>
      <div className="tf__header__actions">
        <Button
          title="Dashboard"
          color="secondary"
          size="small"
          className="tf__header__action tf__header__action-dashboard"
          disabled={active === 'Dashboard'}
          onClick={onDashboardClick}
          disableRipple={true}
        >
          Dashboard
        </Button>
        <Button
          title="Dashboard"
          color="secondary"
          size="small"
          className="tf__header__action tf__header__action-dashboard"
          disabled={active === 'Portfolio'}
          onClick={() => null}
          disableRipple={true}
        >
          Portfolio
        </Button>
        <WalletConnect />
      </div>
    </div>
  );
};
export default Header;
