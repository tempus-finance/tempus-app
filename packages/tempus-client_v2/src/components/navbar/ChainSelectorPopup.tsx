import { FC, useCallback } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { selectedChainState } from '../../state/ChainState';
import { Chain, chainNameToHexChainId, prettifyChainNameLong } from '../../interfaces/Chain';
import Modal from '../modal/Modal';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';

import './ChainSelectorPopup.scss';
import { getChainConfig } from '../../utils/getConfig';

interface ChainSelectorPopupProps {
  open: boolean;
  onClose: () => void;
  requestNetworkChange: (
    chainId: string,
    triggeredByUserAction: boolean,
    showRejectedNotification: boolean,
  ) => Promise<boolean>;
  requestAddNetwork: (
    chainId: string,
    name: string,
    tokenName: string,
    tokenTicker: string,
    tokenDecimals: number,
    rpc: string,
    blockExplorer: string,
  ) => Promise<boolean>;
}

const ChainSelectorPopup: FC<ChainSelectorPopupProps> = ({
  open,
  onClose,
  requestNetworkChange,
  requestAddNetwork,
}) => {
  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const onChainSelect = useCallback(
    async (chain: Chain) => {
      const chainId = chainNameToHexChainId(chain);

      try {
        const requestAccepted = await requestNetworkChange(chainId, false, false);
        if (requestAccepted) {
          selectedChain.set(chain);
        }
      } catch (error: any) {
        // Network we tried to switch to is not yet added to MetaMask
        // Send request to add network to MetaMask
        if (error.message === 'Unknown Network') {
          const chainConfig = getChainConfig(chain);

          const chainIdHex = chainNameToHexChainId(chain);
          const chainName = prettifyChainNameLong(chain);

          const requestAccepted = await requestAddNetwork(
            chainIdHex,
            chainName,
            chainConfig.nativeToken,
            chainConfig.nativeToken,
            chainConfig.nativeTokenPrecision,
            chainConfig.networkUrl,
            chainConfig.blockExplorerUrl,
          );
          if (requestAccepted) {
            selectedChain.set(chain);
          }
        } else {
          console.warn('Canceling network change in the app, wallet network change request failed!');
        }
      }

      onClose();
    },
    [selectedChain, onClose, requestNetworkChange, requestAddNetwork],
  );

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} title="selectNetwork" onClose={onClose}>
      <div className="tc__chainSelectorPopup-content">
        <div
          className={`tc__chainSelectorPopup-button ${selectedChainName === 'ethereum' ? 'selected' : ''}`}
          onClick={() => onChainSelect('ethereum')}
        >
          <Typography variant="body-text">Ethereum Mainnet</Typography>
          <TokenIcon ticker="ETH" width={24} height={24} vectorWidth={20} vectorHeight={20} />
        </div>
        <Spacer size={12} />
        <div
          className={`tc__chainSelectorPopup-button ${selectedChainName === 'fantom' ? 'selected' : ''}`}
          onClick={() => onChainSelect('fantom')}
        >
          <Typography variant="body-text">Fantom Opera</Typography>
          <TokenIcon ticker="FANTOM" width={24} height={24} vectorWidth={24} vectorHeight={24} />
        </div>
        <Spacer size={24} />
        <Typography variant="body-text">Current network:</Typography>
        <Spacer size={12} />
        <div className="tc__chainSelectorPopup-network">
          <Typography variant="h4">{prettifyChainNameLong(selectedChainName || 'ethereum')}</Typography>
        </div>
      </div>
    </Modal>
  );
};
export default ChainSelectorPopup;
