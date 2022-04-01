import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenETH: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
      fill="#627EEA"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.25 20.275L20.6225 5V16.0875L11.25 20.275ZM20.6225 27.4588V34.9938L11.25 22.0201L20.6225 27.4588Z"
      fill="white"
    />
    <path d="M20.625 25.7163L29.9962 20.275L20.625 16.09V25.7163Z" fill="white" fill-opacity="0.2" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.625 5V16.0875L29.9962 20.275L20.625 5ZM20.625 27.4573V34.991L30.0025 22.0173L20.625 27.4573ZM20.6225 25.7163L11.25 20.275L20.6225 16.09V25.7163Z"
      fill="white"
      fillOpacity="0.6"
    />
  </svg>
);

export default withLogo(TokenETH);
