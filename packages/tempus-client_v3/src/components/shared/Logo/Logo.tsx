import { FC, memo } from 'react';

import TokenETH from './TokenETH';
import TokenETHLight from './TokenETHLight';
import TokenUSDC from './TokenUSDC';
import TokenUSDT from './TokenUSDT';
import TokenDAI from './TokenDAI';
import TokenFTM from './TokenFTM';
import TokenMIM from './TokenMIM';
import TokenRARI from './TokenRARI';
import TokenYFI from './TokenYFI';
import TokenWBTC from './TokenWBTC';
import TokenWBTCDark from './TokenWBTCDark';
import TokenWETH from './TokenWETH';
import TokenWFTM from './TokenWFTM';
import TokenStETH from './TokenStETH';
import TokenYvUSDC from './TokenYvUSDC';
import TokenYvUSDT from './TokenYvUSDT';
import TokenYvDAI from './TokenYvDAI';
import TokenYvBTC from './TokenYvBTC';
import TokenYvYFI from './TokenYvYFI';
import TokenYvwETH from './TokenYvwETH';
import ProtocolAave from './ProtocolAave';
import ProtocolLido from './ProtocolLido';
import ProtocolRari from './ProtocolRari';
import WalletMetamask from './WalletMetamask';
import WalletWalletConnect from './WalletWalletConnect';
import WalletGnosis from './WalletGnosis';

export const LOGO_SIZE_SMALL = 24;
export const LOGO_SIZE_MEDIUM = 32;
export const LOGO_SIZE_LARGE = 40;
export const LOGO_SIZE_DEFAULT = LOGO_SIZE_MEDIUM;

export type LogoType = 'token' | 'protocol' | 'wallet';

export type TokenLogoType =
  | 'token-ETH'
  | 'token-ETH-light'
  | 'token-USDC'
  | 'token-USDT'
  | 'token-DAI'
  | 'token-FTM'
  | 'token-MIM'
  | 'token-RARI'
  | 'token-YFI'
  | 'token-wBTC'
  | 'token-wBTC-dark'
  | 'token-wETH'
  | 'token-wFTM'
  | 'token-stETH'
  | 'token-yvUSDC'
  | 'token-yvUSDT'
  | 'token-yvDAI'
  | 'token-yvBTC'
  | 'token-yvYFI'
  | 'token-yvwETH';

export type ProtocolLogoType = 'protocol-Aave' | 'protocol-Lido' | 'protocol-Rari';

export type WalletLogoType = 'wallet-metamask' | 'wallet-walletconnect' | 'wallet-gnosis';

export interface LogoProps {
  size?: 'large' | 'medium' | 'small' | number;
}

const TokenLogo: FC<LogoProps & { type: TokenLogoType }> = memo(props => {
  switch (props.type) {
    case 'token-ETH':
      return <TokenETH {...props} />;
    case 'token-ETH-light':
      return <TokenETHLight {...props} />;
    case 'token-USDC':
      return <TokenUSDC {...props} />;
    case 'token-USDT':
      return <TokenUSDT {...props} />;
    case 'token-DAI':
      return <TokenDAI {...props} />;
    case 'token-FTM':
      return <TokenFTM {...props} />;
    case 'token-MIM':
      return <TokenMIM {...props} />;
    case 'token-RARI':
      return <TokenRARI {...props} />;
    case 'token-YFI':
      return <TokenYFI {...props} />;
    case 'token-wBTC':
      return <TokenWBTC {...props} />;
    case 'token-wBTC-dark':
      return <TokenWBTCDark {...props} />;
    case 'token-wETH':
      return <TokenWETH {...props} />;
    case 'token-wFTM':
      return <TokenWFTM {...props} />;
    case 'token-stETH':
      return <TokenStETH {...props} />;
    case 'token-yvUSDC':
      return <TokenYvUSDC {...props} />;
    case 'token-yvUSDT':
      return <TokenYvUSDT {...props} />;
    case 'token-yvDAI':
      return <TokenYvDAI {...props} />;
    case 'token-yvBTC':
      return <TokenYvBTC {...props} />;
    case 'token-yvYFI':
      return <TokenYvYFI {...props} />;
    case 'token-yvwETH':
      return <TokenYvwETH {...props} />;
    default:
      return null;
  }
});

const ProtocolLogo: FC<LogoProps & { type: ProtocolLogoType }> = memo(props => {
  switch (props.type) {
    case 'protocol-Aave':
      return <ProtocolAave {...props} />;
    case 'protocol-Lido':
      return <ProtocolLido {...props} />;
    case 'protocol-Rari':
      return <ProtocolRari {...props} />;
    default:
      return null;
  }
});

const WalletLogo: FC<LogoProps & { type: WalletLogoType }> = memo(props => {
  switch (props.type) {
    case 'wallet-metamask':
      return <WalletMetamask {...props} />;
    case 'wallet-walletconnect':
      return <WalletWalletConnect {...props} />;
    case 'wallet-gnosis':
      return <WalletGnosis {...props} />;
    default:
      return null;
  }
});

const Logo: FC<LogoProps & { variant: LogoType; type: TokenLogoType & WalletLogoType & ProtocolLogoType }> = memo(
  props => {
    switch (props.variant) {
      case 'token':
        return <TokenLogo {...props} />;
      case 'protocol':
        return <ProtocolLogo {...props} />;
      case 'wallet':
        return <WalletLogo {...props} />;
      default:
        return null;
    }
  },
);

export { Logo, TokenLogo, ProtocolLogo, WalletLogo };
