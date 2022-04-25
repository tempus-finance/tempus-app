import { FC } from 'react';
import { ButtonWrapper, colors, Icon, Logo, Typography, WalletButton } from '../shared';

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
      <WalletButton
        address=""
        balance=""
        chain="ethereum"
        onConnect={() => {}}
        onNetworkClick={() => {}}
        onWalletClick={() => {}}
      />
    </div>
  </div>
);
export default Navbar;
