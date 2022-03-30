import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const RightArrow: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.7043 8.7113L9.70648 14.7091C9.61328 14.8023 9.50263 14.8763 9.38085 14.9267C9.25907 14.9771 9.12855 15.0031 8.99674 15.0031C8.86493 15.0031 8.73441 14.9771 8.61263 14.9267C8.49085 14.8763 8.3802 14.8023 8.287 14.7091C8.19379 14.6159 8.11986 14.5053 8.06942 14.3835C8.01897 14.2617 7.99301 14.1312 7.99301 13.9994C7.99301 13.8676 8.01897 13.737 8.06942 13.6153C8.11986 13.4935 8.19379 13.3828 8.287 13.2896L12.5854 9.00119H0.999638C0.734517 9.00119 0.480256 8.89587 0.292787 8.7084C0.105319 8.52094 0 8.26667 0 8.00155C0 7.73643 0.105319 7.48217 0.292787 7.2947C0.480256 7.10724 0.734517 7.00192 0.999638 7.00192H12.5854L8.287 2.71347C8.09876 2.52524 7.99301 2.26993 7.99301 2.00373C7.99301 1.73752 8.09876 1.48222 8.287 1.29399C8.47523 1.10575 8.73053 1 8.99674 1C9.26294 1 9.51825 1.10575 9.70648 1.29399L15.7043 7.29181C15.798 7.38474 15.8724 7.4953 15.9231 7.61712C15.9739 7.73893 16 7.86959 16 8.00155C16 8.13352 15.9739 8.26418 15.9231 8.38599C15.8724 8.50781 15.798 8.61837 15.7043 8.7113Z"
      fill="#062330"
    />
  </svg>
);

export default withIcon(RightArrow);
