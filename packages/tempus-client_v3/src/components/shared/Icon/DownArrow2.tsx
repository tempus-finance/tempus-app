import React, { FC } from 'react';
import { IconProps } from './index';
import withIcon from './withIcon';

const DownArrow2: FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.38409 11.8326C6.17196 12.0558 5.82804 12.0558 5.61591 11.8326L2.1591 8.19608C1.94697 7.97293 1.94697 7.61112 2.1591 7.38796C2.37122 7.1648 2.71515 7.1648 2.92728 7.38796L5.45681 10.049L5.45681 0L6.54319 9.49736e-08L6.54319 10.049L9.07272 7.38796C9.28485 7.1648 9.62878 7.1648 9.8409 7.38796C10.053 7.61112 10.053 7.97293 9.8409 8.19608L6.38409 11.8326Z"
      fill="#FF0F0F"
    />
  </svg>
);

export default withIcon(DownArrow2);
