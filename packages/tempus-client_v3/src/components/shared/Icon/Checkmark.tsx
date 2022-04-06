import React, { FC } from 'react';
import { IconProps, ICON_COLOR_DEFAULT, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const Checkmark: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT, color = ICON_COLOR_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-checkmark"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 8.1003L6 14L16 4L14 2L6 10L2 6L0 8.1003Z" fill={color} />
  </svg>
);

export default withIcon(Checkmark);
