import React, { FC, memo } from 'react';
import { colors } from '../Colors';
import Button from '../Button';
import Typography from '../Typography';
import Icon from '../Icon';
import Logo, { LogoType } from '../Logo';

import './switcher-button.scss';

export interface SwitcherButtonProps {
  logoType: LogoType;
  label?: string;
  title?: string;
  selected: boolean;
  onClick: () => void;
}

const SwitcherButton: FC<SwitcherButtonProps> = props => {
  const { logoType, label, title, selected, onClick } = props;

  return (
    <Button className="tc__switcher-btn" title={title} onClick={onClick}>
      <div className="tc__switcher-btn__label">
        <Typography variant="body-primary" weight={selected ? 'bold' : 'regular'}>
          {label}
        </Typography>
        {selected && <Icon type="checkmark" color={colors.textSuccess} size="small" />}
      </div>
      <Logo type={logoType} size="small" />
    </Button>
  );
};

export default memo(SwitcherButton);
