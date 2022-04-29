import { FC } from 'react';
import { TooltipWrapper, Typography, colors, Icon } from '../shared';
import SettingsPopup from './SettingsPopup';

import './SettingsDropdown.scss';

const SettingsDropdown: FC = () => (
  <TooltipWrapper {...{ tooltip: <SettingsPopup />, placement: 'bottom-left' }}>
    <div className="tc__navbar-actions-dropdown">
      <Typography variant="body-primary" color="text-primary-inverted">
        Settings
      </Typography>
      <div className="tc__navbar-actions-dropdown-icon">
        <Icon variant="down-chevron" size={12} color={colors.textPrimaryInverted} />
      </div>
    </div>
  </TooltipWrapper>
);

export default SettingsDropdown;
