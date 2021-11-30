import { FC, useMemo } from 'react';
import UserWallet from '../../interfaces/UserWallet';
import { walletIcons } from './walletIcons';

type WalletIconInProps = {
  wallet: UserWallet;
  width?: number;
  height?: number;
};

const WalletIcon: FC<WalletIconInProps> = ({ wallet, width, height }): JSX.Element => {
  const icon = useMemo(() => walletIcons[wallet], [wallet]);
  const __html = useMemo(() => `<title>${wallet}</title>${icon}`, [wallet, icon]);

  return icon ? (
    <svg
      aria-hidden="true"
      className="tf__wallet__icon"
      width={getWidth(wallet)}
      height={getHeight(wallet)}
      viewBox={`0 0 ${getWidth(wallet)} ${getHeight(wallet)}`}
      role="img"
      dangerouslySetInnerHTML={{ __html }}
    ></svg>
  ) : (
    <></>
  );
};

export default WalletIcon;

const getWidth = (wallet: UserWallet): number => {
  switch (wallet) {
    case 'MetaMask':
    case 'WalletConnect':
      return 20;

    default:
      return 20;
  }
};

const getHeight = (wallet: UserWallet): number => {
  switch (wallet) {
    case 'MetaMask':
      return 18;

    case 'WalletConnect':
      return 20;

    default:
      return 20;
  }
};
