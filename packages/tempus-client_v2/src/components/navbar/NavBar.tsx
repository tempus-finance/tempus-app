import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TempusLogo from './tempusLogo';
import Links from './Links';
import Wallet from '../wallet/Wallet';

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
      </div>

      <div className="tc__navBar__right">
        <Links />
        <Wallet />
      </div>
    </div>
  );
};

export default NavBar;
