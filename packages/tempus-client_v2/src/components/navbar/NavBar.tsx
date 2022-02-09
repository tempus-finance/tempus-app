import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TempusLogo from './tempusLogo';
import ChainSelector from './ChainSelector';
import Links from './Links';
import Wallet from '../wallet/Wallet';
import Spacer from '../spacer/spacer';

import './NavBar.scss';

const NavBar: FC = () => {
  const navigate = useNavigate();

  const onLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="tc__navBar">
      <div className="tc__navBar__left">
        <div className="tc__navBar__logo" onClick={onLogoClick}>
          <TempusLogo />
        </div>
        <Spacer size={14} />
        <ChainSelector />
      </div>

      <div className="tc__navBar__right">
        <Links />
        <Wallet />
      </div>
    </div>
  );
};

export default NavBar;
