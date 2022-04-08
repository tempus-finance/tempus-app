import React, { FC, memo } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT, LOGO_SIZE_LARGE, LOGO_SIZE_MEDIUM, LOGO_SIZE_SMALL } from './Logo';

const withLogo = (Component: React.ComponentType<LogoProps>): FC<LogoProps> =>
  memo(({ size }) => {
    let actualSize = size;
    switch (size) {
      case 'large':
        actualSize = LOGO_SIZE_LARGE;
        break;
      case 'medium':
        actualSize = LOGO_SIZE_MEDIUM;
        break;
      case 'small':
        actualSize = LOGO_SIZE_SMALL;
        break;
      case undefined:
        actualSize = LOGO_SIZE_DEFAULT;
        break;
      default:
        actualSize = LOGO_SIZE_DEFAULT;
    }
    return <Component size={actualSize} />;
  });

export default withLogo;
