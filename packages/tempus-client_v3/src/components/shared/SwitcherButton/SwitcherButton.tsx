import React, { FC, memo } from 'react';
import { colors } from '../Colors';
import ButtonWrapper from '../ButtonWrapper';
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
    <ButtonWrapper className="tc__switcher-btn" title={title} onClick={onClick}>
      <div className="tc__switcher-btn__label">
        <Typography variant="body-primary" weight={selected ? 'bold' : 'regular'}>
          {label}
        </Typography>
        {selected && <Icon variant="checkmark" color={colors.textSuccess} size="small" />}
      </div>
      <Logo type={logoType} size="small" />
    </ButtonWrapper>
  );
};

export default memo(SwitcherButton);
