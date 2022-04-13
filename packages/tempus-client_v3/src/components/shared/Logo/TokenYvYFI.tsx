import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenYvYFI: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg
    className="tc__logo tc__logo-token-yvYFI"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="20" fill="white" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.6875 6.5625H5.3125V9.6875H9.6875L9.6875 13.4375H12.8125V9.6875V6.5625H9.6875Z"
      fill="#0657F9"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.0804 7.2425C17.411 6.80132 18.8339 6.5625 20.3125 6.5625C27.7338 6.5625 33.75 12.5787 33.75 20C33.75 27.4213 27.7338 33.4375 20.3125 33.4375C12.8912 33.4375 6.875 27.4213 6.875 20C6.875 16.0299 8.59669 12.462 11.3342 10.002L10.4479 6.69436C6.3836 9.71252 3.75 14.5487 3.75 20C3.75 29.1472 11.1653 36.5625 20.3125 36.5625C29.4597 36.5625 36.875 29.1472 36.875 20C36.875 10.8528 29.4597 3.4375 20.3125 3.4375C18.5543 3.4375 16.8601 3.71145 15.2703 4.219L16.0804 7.2425Z"
      fill="#0657F9"
    />
    <path d="M19.3863 26.4648V14.0198H20.7415V26.4648H19.3863Z" fill="black" />
    <path
      d="M26.2852 18.1651L22.0999 19.275L21.1666 14.9312L22.4111 14.65L22.9017 16.7082C22.9017 16.7082 24.0325 14.8534 22.5247 12.9328C21.6362 11.9456 21.2144 11.9037 20.2182 11.7482C19.3417 11.6225 17.3044 11.9187 16.6971 14.297C16.4399 15.8287 16.73 16.9625 18.7045 18.4463L18.5938 20.0977C18.5938 20.0977 16.389 18.545 15.8206 17.4561C15.3808 16.5945 14.627 14.8923 15.9881 12.523C16.7211 11.3383 18.166 10.2015 20.7118 10.3212C21.9922 10.375 25.1184 11.9396 24.6338 15.5953C24.55 16.2804 24.194 17.1929 24.194 17.1929L25.9112 16.8099L26.2852 18.1651Z"
      fill="black"
    />
    <path
      d="M23.8945 27.9035C23.1286 29.0672 21.6538 30.1651 19.1139 29.9797C17.8335 29.8929 14.7522 28.2445 15.3325 24.6038C15.4343 23.9217 15.8142 23.0212 15.8142 23.0212L14.088 23.3563L13.75 21.9951L17.9651 20.9959L18.7848 25.3637L17.5314 25.612L17.0946 23.5388C17.0946 23.5388 15.9159 25.3607 17.3698 27.3231C18.2314 28.3343 18.6502 28.3851 19.6464 28.5676C20.517 28.7172 22.5632 28.4719 23.2333 26.1115C23.5295 24.5888 23.2692 23.446 21.3367 21.9084L21.4922 20.26C21.4922 20.26 23.6551 21.8695 24.1936 22.9734C24.6065 23.8499 25.3155 25.5731 23.8945 27.9035Z"
      fill="black"
    />
  </svg>
);

export default withLogo(TokenYvYFI);