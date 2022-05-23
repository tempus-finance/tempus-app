import { FC } from 'react';
import SettingsDropdown from '../SettingsDropdown';
import Wallet from '../Wallet';

import './Navbar.scss';

const Navbar: FC = () => (
  <div className="tc__navbar">
    <div className="tc__navbar-tempus-logo" />
    <div className="tc__navbar-actions">
      <SettingsDropdown />
      <Wallet />
    </div>
  </div>
);
export default Navbar;
