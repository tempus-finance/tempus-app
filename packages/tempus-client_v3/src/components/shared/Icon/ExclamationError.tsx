import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const ExclamationError: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.04566 1.54327C7.46762 0.81891 8.53238 0.81891 8.95434 1.54327L15.8536 13.3868C16.2723 14.1056 15.7432 15 14.8992 15H1.10078C0.256824 15 -0.272275 14.1056 0.146446 13.3868L7.04566 1.54327Z"
      fill="#FF0F0F"
    />
    <path
      d="M7 6.00314V8.98597C7 9.54015 7.44767 9.9894 7.9999 9.9894C8.55221 9.9894 8.99991 9.54003 8.9998 8.98577L8.9992 6.00293C8.99909 5.45985 8.56833 5.01548 8.02737 5.0004C7.46465 4.9847 7 5.43821 7 6.00314Z"
      fill="white"
    />
    <path
      d="M8.9995 11.997C8.99978 11.4427 8.55209 10.9929 7.99975 10.9929C7.4476 10.9929 7 11.4424 7 11.9965C7 12.5506 7.4476 13 7.99975 13C8.5517 13 8.99922 12.5509 8.9995 11.997Z"
      fill="white"
    />
  </svg>
);

export default withIcon(ExclamationError);
