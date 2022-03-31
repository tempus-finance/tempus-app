import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const ProtocolLido: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
      fill="#F69988"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.0099 5.85938L27.0255 16.8152L20.0095 20.8942L12.9944 16.815L20.0099 5.85938ZM15.142 16.297L20.0099 8.69508L24.8778 16.297L20.0095 19.1273L15.142 16.297Z"
      fill="white"
    />
    <path
      d="M19.999 23.3023L11.8606 18.57L11.6384 18.9171C9.13186 22.8314 9.69163 27.9578 12.9843 31.2421C16.859 35.1068 23.141 35.1068 27.0157 31.2421C30.3083 27.9578 30.8681 22.8314 28.3616 18.9171L28.1393 18.5699L19.9993 23.3025L19.999 23.3023Z"
      fill="white"
    />
  </svg>
);

export default withLogo(ProtocolLido);
