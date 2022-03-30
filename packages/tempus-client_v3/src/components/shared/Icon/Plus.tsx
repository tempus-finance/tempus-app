import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const Plus: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.99475 15.0053C8.99475 15.2691 8.88994 15.5221 8.70339 15.7086C8.51684 15.8952 8.26382 16 8 16C7.73618 16 7.48316 15.8952 7.29661 15.7086C7.11006 15.5221 7.00526 15.2691 7.00526 15.0053L7.01226 8.98774L0.994746 8.99475C0.730923 8.99475 0.477905 8.88994 0.291354 8.70339C0.104803 8.51684 0 8.26382 0 8C0 7.73618 0.104803 7.48316 0.291354 7.29661C0.477905 7.11006 0.730922 7.00526 0.994745 7.00526L7.01226 7.01226L7.00525 0.994746C7.00525 0.730923 7.11006 0.477905 7.29661 0.291354C7.48316 0.104803 7.73618 0 8 0C8.26382 0 8.51684 0.104803 8.70339 0.291354C8.88994 0.477905 8.99475 0.730923 8.99475 0.994746L8.98774 7.01226L15.0053 7.00526C15.2691 7.00526 15.5221 7.11006 15.7086 7.29661C15.8952 7.48316 16 7.73618 16 8C16 8.26382 15.8952 8.51684 15.7086 8.70339C15.5221 8.88994 15.2691 8.99475 15.0053 8.99475L8.98774 8.98774L8.99475 15.0053Z"
      fill="#062330"
    />
  </svg>
);

export default withIcon(Plus);
