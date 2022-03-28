import React, { FC } from 'react';
import { IconProps } from './index';
import withIcon from './withIcon';

const DownChevronIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_909_5439)">
      <path
        d="M15.7387 5.36992L8.63082 11.7636C8.54823 11.8385 8.44996 11.898 8.34169 11.9385C8.23342 11.9791 8.11729 12 8 12C7.88271 12 7.76658 11.9791 7.65831 11.9385C7.55004 11.898 7.45177 11.8385 7.36918 11.7636L0.261296 5.36992C0.0939908 5.21942 -2.49304e-09 5.01531 0 4.80248C2.49304e-09 4.58965 0.0939908 4.38554 0.261296 4.23504C0.428601 4.08455 0.655515 4 0.89212 4C1.12873 4 1.35564 4.08455 1.52294 4.23504L8 10.0693L14.4771 4.23504C14.6444 4.08455 14.8713 4 15.1079 4C15.3445 4 15.5714 4.08455 15.7387 4.23504C15.906 4.38554 16 4.58965 16 4.80248C16 5.01531 15.906 5.21942 15.7387 5.36992Z"
        fill="#062330"
      />
    </g>
    <defs>
      <clipPath id="clip0_909_5439">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default withIcon(DownChevronIcon);
