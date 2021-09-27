import { FC } from 'react';
import Button from '@material-ui/core/Button';
import WalletConnect from '../wallet-connect/wallet-connect';
import Typography from '../typography/Typography';
import TempusLogo from './tempusLogo';

import './header.scss';

export type HeaderLinks = 'Dashboard' | 'Portfolio' | 'Statistics';

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
        <TempusLogo fillColor="black" onClick={onLogoClick} />
      </div>
      <div className="tf__header__actions">
        <WalletConnect />
      </div>
    </div>
  );
};
export default Header;
