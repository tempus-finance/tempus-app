import React, { FC, memo } from 'react';
import { IconProps, ICON_SIZE_DEFAULT, ICON_SIZE_LARGE, ICON_SIZE_MEDIUM, ICON_SIZE_SMALL } from './Icon';

const withIcon = (Component: React.ComponentType<IconProps>): FC<IconProps> =>
  memo(({ size }) => {
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
      case undefined:
        actualSize = ICON_SIZE_DEFAULT;
        break;
    }
    return <Component size={actualSize} />;
  });

export default withIcon;
