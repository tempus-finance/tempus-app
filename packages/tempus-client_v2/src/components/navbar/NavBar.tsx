import { FC } from 'react';
import TempusLogo from './tempusLogo';
import Links from './Links';
import Wallet from './Wallet';
import './NavBar.scss';

const NavBar: FC = () => {
  return (
    <div className="tc__navBar">
      <div className="tc__navBar__left">
        <TempusLogo />
      </div>

      <div className="tc__navBar__right">
        <Links />
        <Wallet />
      </div>
    </div>
  );
};

export default NavBar;
