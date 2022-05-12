import React, { FC, memo } from 'react';
import IconProps, { InnerIconProps } from './IconProps';
import {
  ICON_COLOR_DEFAULT,
  ICON_SIZE_DEFAULT,
  ICON_SIZE_LARGE,
  ICON_SIZE_MEDIUM,
  ICON_SIZE_SMALL,
  ICON_SIZE_TINY,
} from './IconConstants';

const withIcon = (Component: React.ComponentType<InnerIconProps>): FC<IconProps> =>
  memo(({ size, color }) => {
    let actualSize = size;
    switch (size) {
      case 'large':
        actualSize = ICON_SIZE_LARGE;
        break;
      case 'medium':
        actualSize = ICON_SIZE_MEDIUM;
        break;
      case 'small':
        actualSize = ICON_SIZE_SMALL;
        break;
      case 'tiny':
        actualSize = ICON_SIZE_TINY;
        break;
      default:
    }
    return <Component size={actualSize ?? ICON_SIZE_DEFAULT} color={color ?? ICON_COLOR_DEFAULT} />;
  });

export default withIcon;
