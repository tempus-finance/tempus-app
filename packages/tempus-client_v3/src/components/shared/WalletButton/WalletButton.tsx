import { FC, memo, useMemo } from 'react';
import Blockies from 'react-blockies';
import { Chain, chainToTicker, shortenAccount } from 'tempus-core-services';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Logo from '../Logo';
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

  const selectedChainTokenTicker = useMemo(() => {
    return chainToTicker(chain);
  }, [chain]);

  const shortAddress = useMemo(() => {
    return shortenAccount(address);
  }, [address]);

  const supportedChain = chain !== 'unsupported';

  return (
    <>
      {!address && (
        <ButtonWrapper className="tc__walletButton__disconnected" onClick={onConnect}>
          <Typography variant="body-primary" weight="bold">
            {/* TODO - Needs translations */}
            Connect Wallet
          </Typography>
        </ButtonWrapper>
      )}
      {address && (
        <div className="tc__walletButton__connected">
          <ButtonWrapper className="tc__walletButton__connected-network" onClick={onNetworkClick}>
            {!supportedChain && <Icon type="exclamation-error" size={20} />}
            {supportedChain && <Logo type={`token-${selectedChainTokenTicker}`} size="small" />}
          </ButtonWrapper>
          <ButtonWrapper
            className="tc__walletButton__connected-wallet"
            disabled={!supportedChain}
            onClick={onWalletClick}
          >
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
          </ButtonWrapper>
        </div>
      )}
    </>
  );
};
export default memo(WalletButton);
