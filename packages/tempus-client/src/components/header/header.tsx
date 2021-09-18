import { FC } from 'react';
import Button from '@material-ui/core/Button';
import WalletConnect from '../wallet-connect/wallet-connect';
import Typography from '../typography/Typography';
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
        <TempusLogo fillColor="black" onClick={onLogoClick} />
      </div>
      <div className="tf__header__actions">
        <Button
          title="Dashboard"
          size="small"
          className="tf__header__action"
          disabled={active === 'Dashboard'}
          onClick={onDashboardClick}
          disableRipple={true}
        >
          <Typography color={active === 'Dashboard' ? 'accent' : 'default'} variant="h3">
            Dashboard
          </Typography>
        </Button>
        <Button
          title="Dashboard"
          size="small"
          className="tf__header__action"
          disabled={active === 'Portfolio'}
          onClick={() => null}
          disableRipple={true}
        >
          <Typography color={active === 'Portfolio' ? 'accent' : 'default'} variant="h3">
            Portfolio
          </Typography>
        </Button>
        <WalletConnect />
      </div>
    </div>
  );
};
export default Header;
