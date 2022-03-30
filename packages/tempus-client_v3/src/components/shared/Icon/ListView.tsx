import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const ListView: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 3H23.4C23.7314 3 24 3.26863 24 3.6V6C24 6.33137 23.7314 6.6 23.4 6.6H6.6V3Z" fill="#BFC0C0" />
    <path d="M0 3.6C0 3.26863 0.268629 3 0.6 3H5.4V6.6H0.6C0.268629 6.6 0 6.33137 0 6V3.6Z" fill="#BFC0C0" />
    <path
      d="M6.6 10.2H23.4C23.7314 10.2 24 10.4686 24 10.8V13.2C24 13.5314 23.7314 13.8 23.4 13.8H6.6V10.2Z"
      fill="#BFC0C0"
    />
    <path
      d="M0 10.8C0 10.4686 0.268629 10.2 0.6 10.2H5.4V13.8H0.6C0.268629 13.8 0 13.5314 0 13.2V10.8Z"
      fill="#BFC0C0"
    />
    <path
      d="M6.6 17.4H23.4C23.7314 17.4 24 17.6686 24 18V20.4C24 20.7314 23.7314 21 23.4 21H6.6V17.4Z"
      fill="#BFC0C0"
    />
    <path d="M0 18C0 17.6686 0.268629 17.4 0.6 17.4H5.4V21H0.6C0.268629 21 0 20.7314 0 20.4V18Z" fill="#BFC0C0" />
  </svg>
);

export default withIcon(ListView);
