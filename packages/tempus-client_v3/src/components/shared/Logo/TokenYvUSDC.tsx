import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenYvUSDC: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="white" />
    <path
      d="M23.4692 21.7746C23.4692 19.9508 22.3749 19.3255 20.1863 19.065C18.623 18.8565 18.3104 18.4397 18.3104 17.7101C18.3104 16.9805 18.8315 16.5116 19.8737 16.5116C20.8116 16.5116 21.3328 16.8243 21.5933 17.6059C21.6454 17.7622 21.8018 17.8664 21.9581 17.8664H22.7918C23.0002 17.8664 23.1566 17.7101 23.1566 17.5017V17.4496C22.9481 16.3031 22.0101 15.4174 20.8116 15.3132V14.0626C20.8116 13.8541 20.6553 13.6978 20.3948 13.6456H19.6132C19.4047 13.6456 19.2484 13.802 19.1962 14.0626V15.2611C17.633 15.4695 16.643 16.5116 16.643 17.8144C16.643 19.534 17.6851 20.2113 19.8737 20.472C21.3328 20.7325 21.8018 21.0451 21.8018 21.8789C21.8018 22.7127 21.0721 23.2859 20.0821 23.2859C18.7272 23.2859 18.2582 22.7126 18.102 21.931C18.0499 21.7226 17.8936 21.6183 17.7373 21.6183H16.8513C16.643 21.6183 16.4867 21.7746 16.4867 21.9831V22.0353C16.695 23.3379 17.5288 24.2759 19.2484 24.5365V25.7871C19.2484 25.9955 19.4047 26.1518 19.6652 26.204H20.4468C20.6553 26.204 20.8116 26.0476 20.8638 25.7871V24.5365C22.4271 24.2759 23.4692 23.1816 23.4692 21.7746Z"
      fill="black"
    />
    <path
      d="M17.3726 27.2476C13.308 25.7887 11.2236 21.2552 12.7349 17.2427C13.5165 15.0541 15.2361 13.3866 17.3726 12.605C17.581 12.5008 17.6852 12.3445 17.6852 12.0838V11.3543C17.6852 11.1459 17.581 10.9895 17.3726 10.9375C17.3204 10.9375 17.2162 10.9375 17.1641 10.9895C12.2137 12.5528 9.50399 17.8159 11.0673 22.7663C12.0052 25.6844 14.246 27.9251 17.1641 28.8631C17.3726 28.9673 17.581 28.8631 17.6331 28.6546C17.6852 28.6026 17.6852 28.5504 17.6852 28.4462V27.7166C17.6852 27.5603 17.5289 27.352 17.3726 27.2476ZM22.8962 10.9895C22.6877 10.8853 22.4792 10.9895 22.4272 11.198C22.3751 11.2502 22.3751 11.3022 22.3751 11.4065V12.136C22.3751 12.3445 22.5314 12.5528 22.6877 12.6571C26.7523 14.1161 28.8367 18.6496 27.3254 22.6621C26.5438 24.8507 24.8242 26.5182 22.6877 27.2998C22.4792 27.404 22.3751 27.5603 22.3751 27.8209V28.5504C22.3751 28.7589 22.4792 28.9152 22.6877 28.9673C22.7399 28.9673 22.844 28.9673 22.8962 28.9152C27.8465 27.352 30.5563 22.0888 28.993 17.1385C28.055 14.1682 25.7621 11.9275 22.8962 10.9895Z"
      fill="black"
    />
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
  </svg>
);

export default withLogo(TokenYvUSDC);
