import React, { FC, memo } from 'react';
import PlusRoundIcon from './PlusRoundIcon';
import CheckmarkRoundIcon from './CheckmarkRoundIcon';
import MinusRoundIcon from './MinusRoundIcon';
import CrossRoundIcon from './CrossRoundIcon';
import UpChevronIcon from './UpChevronIcon';
import RightChevronIcon from './RightChevronIcon';
import LeftChevronIcon from './LeftChevronIcon';
import DownChevronIcon from './DownChevronIcon';

export type IconType =
  | 'plus-round'
  | 'checkmark-round'
  | 'minus-round'
  | 'cross-round'
  | 'up-chevron'
  | 'right-chevron'
  | 'left-chevron'
  | 'down-chevron'
  | 'up-chevron2'
  | 'right-chevron2'
  | 'left-chevron2'
  | 'down-chevron2'
  | 'up-arrow'
  | 'right-arrow'
  | 'left-arrow'
  | 'down-arrow'
  | 'up-arrow2'
  | 'right-arrow2'
  | 'left-arrow2'
  | 'down-arrow2'
  | 'list-view'
  | 'grid-view'
  | 'plus-operation'
  | 'minus-operation'
  | 'menu'
  | 'close'
  | 'info'
  | 'info-bordered'
  | 'info-solid'
  | 'exclamation'
  | 'exclamation-bordered'
  | 'exclamation-neutral'
  | 'exclamation-error'
  | 'checkmark'
  | 'checkmark-bordered'
  | 'checkmark-solid'
  | 'loading'
  | 'external'
  | 'twitter'
  | 'discord'
  | 'medium'
  | 'github'
  | 'telegram'
  | 'scroll'
  | 'slippage'
  | 'globe'
  | 'dark-mode';

export interface IconProps {
  size?: 'large' | 'medium' | 'small' | number;
}

const Icon: FC<IconProps & { type: IconType }> = props => {
  switch (props.type) {
    case 'plus-round':
      return <PlusRoundIcon {...props} />;
    case 'checkmark-round':
      return <CheckmarkRoundIcon {...props} />;
    case 'minus-round':
      return <MinusRoundIcon {...props} />;
    case 'cross-round':
      return <CrossRoundIcon {...props} />;
    case 'up-chevron':
      return <UpChevronIcon {...props} />;
    case 'right-chevron':
      return <RightChevronIcon {...props} />;
    case 'left-chevron':
      return <LeftChevronIcon {...props} />;
    case 'down-chevron':
      return <DownChevronIcon {...props} />;
    default:
      return null;
  }
};

export default memo(Icon);
