import { FC, memo } from 'react';
import Blockies from 'react-blockies';
import { Chain, chainToTicker, shortenAccount } from 'tempus-core-services';
import Button from '../Button';
import Icon from '../Icon';
import { TokenLogo } from '../Logo';
import Typography from '../Typography';

import './WalletButton.scss';

interface WalletButtonProps {
  address: string;
  balance: string;
  chain: Chain;
  onConnect: () => void;
  onNetworkClick: () => void;
  onWalletClick: () => void;
}

const WalletButton: FC<WalletButtonProps> = props => {
  const { address, balance, chain, onConnect, onNetworkClick, onWalletClick } = props;

  const selectedChainTokenTicker = chainToTicker(chain);
  const supportedChain = chain !== 'unsupported';
  const shortAddress = shortenAccount(address);

  return (
    <>
      {!address && (
        <Button className="tc__walletButton__disconnected" onClick={onConnect}>
          <Typography variant="body-primary" weight="bold">
            {/* TODO - Needs translations */}
            Connect Wallet
          </Typography>
        </Button>
      )}
      {address && (
        <div className="tc__walletButton__connected">
          <Button className="tc__walletButton__connected-network" onClick={onNetworkClick}>
            {!supportedChain && <Icon type="exclamation-error" size={20} />}
            {supportedChain && <TokenLogo type={`token-${selectedChainTokenTicker}`} size="small" />}
          </Button>
          <Button className="tc__walletButton__connected-wallet" disabled={!supportedChain} onClick={onWalletClick}>
            {!supportedChain && (
              <Typography variant="body-primary" weight="bold">
                Unsupported
              </Typography>
            )}
            {supportedChain && (
              <>
                <div className="tc__walletButton__connected-wallet-logo">
                  <Blockies seed={address} scale={3} size={8} />
                </div>
                <div className="tc__walletButton__connected-wallet-info">
                  <Typography variant="body-tertiary" type="mono" weight="medium">
                    {shortAddress}
                  </Typography>
                  <div className="tc__walletButton__connected-wallet-info-balance">
                    <Typography variant="body-secondary" type="mono" weight="bold">
                      {balance}
                    </Typography>
                    &nbsp;
                    <Typography variant="body-secondary">{selectedChainTokenTicker}</Typography>
                  </div>
                </div>
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};
export default memo(WalletButton);
