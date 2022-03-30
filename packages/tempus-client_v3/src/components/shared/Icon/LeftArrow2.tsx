import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const LeftArrow: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.167368 6.38409C-0.0557891 6.17196 -0.0557892 5.82804 0.167368 5.61591L3.80392 2.1591C4.02707 1.94697 4.38888 1.94697 4.61204 2.1591C4.8352 2.37122 4.8352 2.71515 4.61204 2.92728L1.95098 5.45681L12 5.45681L12 6.54319L1.95098 6.54319L4.61204 9.07272C4.83519 9.28485 4.83519 9.62878 4.61204 9.8409C4.38888 10.053 4.02707 10.053 3.80392 9.8409L0.167368 6.38409Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(LeftArrow);
