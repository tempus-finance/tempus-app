import { FC } from 'react';
import { InnerLogoProps } from './LogoProps';
import withLogo from './withLogo';

const WalletWalletConnect: FC<InnerLogoProps> = ({ size }) => (
  <svg
    className="tc__logo tc__logo-wallet-walletconnect"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40C31.0457 40 40 31.0457 40 20Z"
      fill="url(#paint0_radial_100_3958)"
    />
    <path
      d="M13.5038 15.7354C17.0916 12.0882 22.9084 12.0882 26.4961 15.7354L26.9279 16.1743C27.1073 16.3567 27.1073 16.6523 26.9279 16.8347L25.4509 18.3362C25.3612 18.4274 25.2157 18.4274 25.1261 18.3362L24.5319 17.7322C22.029 15.1878 17.971 15.1878 15.4681 17.7322L14.8318 18.379C14.7421 18.4702 14.5967 18.4702 14.507 18.379L13.0299 16.8775C12.8505 16.6951 12.8505 16.3995 13.0299 16.2171L13.5038 15.7354ZM29.5508 18.8407L30.8654 20.177C31.0448 20.3594 31.0448 20.655 30.8654 20.8374L24.9379 26.8632C24.7585 27.0456 24.4676 27.0456 24.2882 26.8632C24.2882 26.8632 24.2882 26.8632 24.2882 26.8632L20.0812 22.5865C20.0364 22.5409 19.9637 22.5409 19.9188 22.5865H19.9188L15.7119 26.8632C15.5325 27.0456 15.2416 27.0456 15.0623 26.8632C15.0622 26.8632 15.0622 26.8632 15.0622 26.8632L9.13451 20.8373C8.95512 20.655 8.95512 20.3593 9.13451 20.1769L10.4491 18.8406C10.6285 18.6582 10.9193 18.6582 11.0987 18.8406L15.3058 23.1174C15.3507 23.1629 15.4234 23.1629 15.4682 23.1174C15.4682 23.1174 15.4682 23.1174 15.4682 23.1174L19.6751 18.8406C19.8545 18.6582 20.1453 18.6582 20.3247 18.8406C20.3247 18.8406 20.3247 18.8406 20.3247 18.8406L24.5318 23.1174C24.5766 23.1629 24.6494 23.1629 24.6942 23.1174L28.9012 18.8407C29.0806 18.6583 29.3715 18.6583 29.5508 18.8407Z"
      fill="white"
    />
    <defs>
      <radialGradient
        id="paint0_radial_100_3958"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(0 20) scale(40)"
      >
        <stop stopColor="#5D9DF6" />
        <stop offset="1" stopColor="#006FFF" />
      </radialGradient>
    </defs>
  </svg>
);

export default withLogo(WalletWalletConnect);
