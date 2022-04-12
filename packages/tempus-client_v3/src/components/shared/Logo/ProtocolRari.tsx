import { FC } from 'react';
import LogoProps from './LogoProps';
import { LOGO_SIZE_DEFAULT } from './LogoConstants';
import withLogo from './withLogo';

const ProtocolRari: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg
    className="tc__logo tc__logo-protocol-Rari"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_299_1738)" />
    <circle cx="20" cy="20" r="18.552" fill="black" />
    <circle cx="20" cy="20" r="15.6561" fill="url(#paint1_linear_299_1738)" />
    <circle cx="20" cy="20" r="14.2081" fill="black" />
    <circle cx="20" cy="19.9999" r="12.0362" fill="url(#paint2_linear_299_1738)" />
    <circle cx="20" cy="20" r="10.5882" fill="black" />
    <defs>
      <linearGradient
        id="paint0_linear_299_1738"
        x1="1.18735e-08"
        y1="20.0905"
        x2="40"
        y2="20.0905"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="#040404" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_299_1738"
        x1="4.8449"
        y1="19.8747"
        x2="35.6561"
        y2="20.1252"
        gradientUnits="userSpaceOnUse"
      >
        <stop />
        <stop offset="1" stopColor="white" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_299_1738"
        x1="8.34896"
        y1="19.9037"
        x2="32.0362"
        y2="20.0962"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" />
      </linearGradient>
    </defs>
  </svg>
);

export default withLogo(ProtocolRari);
