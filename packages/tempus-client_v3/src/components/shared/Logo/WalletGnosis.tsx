import { FC } from 'react';
import LogoProps from './LogoProps';
import { LOGO_SIZE_DEFAULT } from './LogoConstants';
import withLogo from './withLogo';

const WalletGnosis: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg
    className="tc__logo tc__logo-wallet-gnosis"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20ZM25.9176 20.9967C25.4429 23.836 22.9742 26 20 26C16.6863 26 14 23.3137 14 20C14 16.6863 16.6863 14 20 14C22.9742 14 25.4429 16.164 25.9176 19.0033C25.9448 19.0011 25.9723 19 26 19H34C34.5523 19 35 19.4477 35 20C35 20.5523 34.5523 21 34 21H26C25.9723 21 25.9448 20.9989 25.9176 20.9967Z"
      fill="black"
    />
  </svg>
);

export default withLogo(WalletGnosis);
