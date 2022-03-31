import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenFTM: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
      fill="#13B5EC"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.5 16.125L26 13.5V18.75L21.5 16.125ZM26 27.375L20 30.875L14 27.375V21.25L20 24.75L26 21.25V27.375ZM14 13.5L18.5 16.125L14 18.75V13.5ZM20.75 17.375L25.25 20L20.75 22.625V17.375ZM19.25 22.625L14.75 20L19.25 17.375V22.625ZM25.25 12.25L20 15.25L14.75 12.25L20 9.125L25.25 12.25ZM12.5 11.75V28.125L20 32.375L27.5 28.125V11.75L20 7.5L12.5 11.75Z"
      fill="white"
    />
  </svg>
);

export default withLogo(TokenFTM);
