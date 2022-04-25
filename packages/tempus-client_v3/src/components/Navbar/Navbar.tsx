import { FC } from 'react';
import { ButtonWrapper, colors, Icon, Typography } from '../shared';
import Wallet from '../Wallet';

import './Navbar.scss';

const Navbar: FC = () => (
  <div className="tc__navbar">
    <div className="tc__navbar-tempus-logo" />
    <div className="tc__navbar-actions">
      <ButtonWrapper>
        <div className="tc__navbar-actions-dropdown">
          <Typography variant="body-primary" color="text-primary-inverted">
            Settings
          </Typography>
          <div className="tc__navbar-actions-dropdown-icon">
            <Icon variant="down-chevron" size={12} color={colors.textPrimaryInverted} />
          </div>
        </div>
      </ButtonWrapper>
      <Wallet />
    </div>
  </div>
);
export default Navbar;
