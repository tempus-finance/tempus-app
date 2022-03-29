import React, { FC, memo } from 'react';
import { IconProps } from './index';

const withIcon = (Component: React.ComponentType<IconProps>): FC<IconProps> =>
  memo(({ size }) => {
    let actualSize = size;
    switch (size) {
      case 'large':
        actualSize = 32;
        break;
      case 'medium':
      case undefined:
        actualSize = 24;
        break;
      case 'small':
        actualSize = 16;
        break;
    }
    return <Component size={actualSize} />;
  });

export default withIcon;
