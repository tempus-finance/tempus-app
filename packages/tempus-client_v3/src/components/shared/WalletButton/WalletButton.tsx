import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Blockies from 'react-blockies';
import { Chain, chainToTicker, shortenAccount } from 'tempus-core-services';
import ActionButton, { ActionButtonVariant } from '../ActionButton';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Logo from '../Logo';
import Typography from '../Typography';

import './WalletButton.scss';

export interface WalletButtonProps {
  address: string;
  balance: string;
  chain: Chain;
  onConnect: () => void;
  onNetworkClick: () => void;
  onWalletClick: () => void;
  connectWalletButtonVariant?: ActionButtonVariant;
}

const WalletButton: FC<WalletButtonProps> = props => {
  const { address, balance, chain, onConnect, onNetworkClick, onWalletClick, connectWalletButtonVariant } = props;
  const { t } = useTranslation();

  const selectedChainTokenTicker = useMemo(() => chainToTicker(chain), [chain]);

  const shortAddress = useMemo(() => shortenAccount(address), [address]);

  const supportedChain = chain !== 'unsupported';

  return (
    <>
      {!address && (
        <div className="tc__walletButton__disconnected">
          <ActionButton
            labels={{ default: t('WalletButton.buttonConnectWallet') }}
            onClick={onConnect}
            variant={connectWalletButtonVariant ?? 'secondary'}
            size="large"
            state="default"
          />
        </div>
      )}
      {address && (
        <div className="tc__walletButton__connected">
          <ButtonWrapper className="tc__walletButton__connected-network" onClick={onNetworkClick}>
            {!supportedChain && <Icon variant="exclamation-error" size={20} />}
            {supportedChain && <Logo type={`token-${selectedChainTokenTicker}`} size="small" />}
          </ButtonWrapper>
          <ButtonWrapper
            className="tc__walletButton__connected-wallet"
            disabled={!supportedChain}
            onClick={onWalletClick}
          >
            {!supportedChain && (
              <Typography variant="body-primary" weight="bold">
                {t('WalletButton.buttonUnsupported')}
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
