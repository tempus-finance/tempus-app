import React, { FC } from 'react';
import { IconProps } from './index';
import withIcon from './withIcon';

const Minus: FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.994746 9L7.01226 8.99296H8.98774L15.0053 9C15.2691 9 15.5221 8.89464 15.7086 8.70711C15.8952 8.51957 16 8.26522 16 8C16 7.73478 15.8952 7.48043 15.7086 7.29289C15.5221 7.10536 15.2691 7 15.0053 7L8.98774 7.00704H7.01226L0.994745 7C0.730922 7 0.477905 7.10536 0.291354 7.29289C0.104803 7.48043 0 7.73478 0 8C0 8.26522 0.104803 8.51957 0.291354 8.70711C0.477905 8.89464 0.730923 9 0.994746 9Z"
      fill="#062330"
    />
  </svg>
);

export default withIcon(Minus);
