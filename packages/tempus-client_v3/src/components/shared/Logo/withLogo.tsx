import React, { FC, memo } from 'react';
import LogoProps, { InnerLogoProps } from './LogoProps';
import { LOGO_SIZE_DEFAULT, LOGO_SIZE_LARGE, LOGO_SIZE_MEDIUM, LOGO_SIZE_SMALL } from './LogoConstants';

const withLogo = (Component: React.ComponentType<InnerLogoProps>): FC<LogoProps> =>
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
      default:
    }
    return <Component size={actualSize ?? LOGO_SIZE_DEFAULT} />;
  });

export default withLogo;
