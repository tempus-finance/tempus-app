import React, { FC, memo } from 'react';
import IconProps from './IconProps';
import { ICON_SIZE_DEFAULT, ICON_SIZE_LARGE, ICON_SIZE_MEDIUM, ICON_SIZE_SMALL, ICON_SIZE_TINY } from './IconConstants';

const withIcon = (Component: React.ComponentType<IconProps>): FC<IconProps> =>
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
      case undefined:
        actualSize = ICON_SIZE_DEFAULT;
        break;
      default:
    }
    return <Component size={actualSize} color={color} />;
  });

export default withIcon;
