import { FC } from 'react';
import Button from '@material-ui/core/Button';
import WalletConnect from '../wallet-connect/wallet-connect';
import TempusLogo from './tempusLogo';

import './header.scss';

type HeaderInProps = {
  active?: string;
};

type HeaderOutProps = {
  onDashboardClick: () => void;
  onLogoClick: () => void;
};

type HeaderProps = HeaderInProps & HeaderOutProps;

const Header: FC<HeaderProps> = ({ active, onDashboardClick, onLogoClick }): JSX.Element => {
  return (
    <div className="tf__header__container">
      <TempusLogo onClick={onLogoClick} />
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
        <WalletConnect />
      </div>
    </div>
  );
};
export default Header;
