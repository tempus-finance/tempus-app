import { FC } from 'react';
import Button from '@material-ui/core/Button';
import WalletConnect from '../wallet-connect/wallet-connect';
import TempusLogo from './tempusLogo';

import './header.scss';

type HeaderInProps = {
  active?: string;
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
          disabled={active === 'DASHBOARD'}
          onClick={onDashboardClick}
        >
          DASHBOARD
        </Button>
        <Button
          title="Dashboard"
          color="secondary"
          size="small"
          className="tf__header__action tf__header__action-dashboard"
          disabled={active === 'PORTFOLIO'}
          onClick={() => null}
        >
          PORTFOLIO
        </Button>
        <WalletConnect />
      </div>
    </div>
  );
};
export default Header;
