import { FC } from 'react';
import { ButtonWrapper, colors, Icon, Logo, Typography } from '../shared';
import Wallet from '../Wallet/Wallet';

import './Navbar.scss';

const Navbar: FC = () => (
  <div className="tc__navbar">
    <Logo type="protocol-Tempus" />
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
      {/* TODO - Integrate wallet button logic */}
      <Wallet />
    </div>
  </div>
);
export default Navbar;
