import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper, Typography, colors, Icon } from '../shared';
import SettingsPopup from './SettingsPopup';

import './SettingsDropdown.scss';

const SettingsDropdown: FC = () => {
  const { t } = useTranslation();

  return (
    <TooltipWrapper tooltipContent={<SettingsPopup />} placement="bottom-left">
      <div className="tc__navbar-actions-dropdown">
        <Typography variant="body-primary" color="text-primary-inverted">
          {t('SettingsDropdown.title')}
        </Typography>
        <div className="tc__navbar-actions-dropdown-icon">
          <Icon variant="down-chevron" size="tiny" color={colors.textPrimaryInverted} />
        </div>
      </div>
    </TooltipWrapper>
  );
};

export default SettingsDropdown;
