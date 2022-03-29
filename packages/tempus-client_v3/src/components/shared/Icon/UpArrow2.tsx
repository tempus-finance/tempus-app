import React, { FC } from 'react';
import { IconProps } from './index';
import withIcon from './withIcon';

const UpArrow: FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.61591 0.167368C5.82804 -0.0557892 6.17196 -0.0557892 6.38409 0.167368L9.8409 3.80392C10.053 4.02707 10.053 4.38888 9.8409 4.61204C9.62878 4.8352 9.28485 4.8352 9.07272 4.61204L6.54319 1.95098L6.54319 12H5.45681L5.45681 1.95098L2.92728 4.61204C2.71515 4.8352 2.37122 4.8352 2.1591 4.61204C1.94697 4.38888 1.94697 4.02707 2.1591 3.80392L5.61591 0.167368Z"
      fill="#4BB543"
    />
  </svg>
);

export default withIcon(UpArrow);
