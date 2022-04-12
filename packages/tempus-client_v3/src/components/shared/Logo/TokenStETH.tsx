import { FC } from 'react';
import LogoProps from './LogoProps';
import { LOGO_SIZE_DEFAULT } from './LogoConstants';
import withLogo from './withLogo';

const TokenStETH: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg
    className="tc__logo tc__logo-token-stETH"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.95433 31.0457 0 20 0C8.95433 0 0 8.95433 0 20C0 31.0457 8.95433 40 20 40Z"
      fill="#F4F6F8"
    />
    <path
      d="M11.796 18.5801L11.5721 18.9236C9.0466 22.7977 9.6106 27.8714 12.9281 31.1219C14.8797 33.0343 17.4377 33.9905 19.9956 33.9908C19.9956 33.9908 19.9956 33.9908 11.796 18.5801Z"
      fill="#00A3FF"
    />
    <path
      opacity="0.6"
      d="M19.9937 23.2638L11.794 18.5801C19.9937 33.9908 19.9937 33.9908 19.9937 33.9908C19.9937 30.6345 19.9937 26.7885 19.9937 23.2638Z"
      fill="#00A3FF"
    />
    <path
      opacity="0.6"
      d="M28.2045 18.5801L28.4284 18.9236C30.9539 22.7977 30.3899 27.8714 27.0724 31.1219C25.1207 33.0343 22.5628 33.9905 20.0049 33.9908C20.0049 33.9908 20.0049 33.9908 28.2045 18.5801Z"
      fill="#00A3FF"
    />
    <path
      opacity="0.2"
      d="M20.0039 23.2638L28.2036 18.5801C20.004 33.9908 20.0039 33.9908 20.0039 33.9908C20.0039 30.6345 20.0039 26.7885 20.0039 23.2638Z"
      fill="#00A3FF"
    />
    <path opacity="0.2" d="M20.0059 12.8008V20.8788L27.0689 16.8424L20.0059 12.8008Z" fill="#00A3FF" />
    <path opacity="0.6" d="M20.0037 12.8008L12.9355 16.8423L20.0037 20.8788V12.8008Z" fill="#00A3FF" />
    <path d="M20.0037 6.00586L12.9355 16.8437L20.0037 12.7907V6.00586Z" fill="#00A3FF" />
    <path opacity="0.6" d="M20.0059 12.7901L27.0743 16.8432L20.0059 6V12.7901Z" fill="#00A3FF" />
  </svg>
);

export default withLogo(TokenStETH);
