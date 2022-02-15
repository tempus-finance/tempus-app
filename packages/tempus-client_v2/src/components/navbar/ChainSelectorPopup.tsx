import { FC, useCallback, useContext } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { getChainConfig } from '../../utils/getConfig';
import { unsupportedNetworkState } from '../../state/ChainState';
import { Chain, chainNameToHexChainId, prettifyChainNameLong } from '../../interfaces/Chain';
import TickIcon from '../icons/TickIcon';
import Modal from '../modal/Modal';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';

import './ChainSelectorPopup.scss';
import { WalletContext } from '../../context/walletContext';

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
  const { userWalletChain } = useContext(WalletContext);

  const unsupportedNetwork = useHookState(unsupportedNetworkState);

  const onChainSelect = useCallback(
    async (chain: Chain) => {
      const chainId = chainNameToHexChainId(chain);

      try {
        const requestAccepted = await requestNetworkChange(chainId, false, false);
        if (requestAccepted) {
          unsupportedNetwork.set(false);
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
            chainConfig.publicNetworkUrl,
            chainConfig.blockExplorerUrl,
          );
          if (requestAccepted) {
            unsupportedNetwork.set(false);
          }
        } else {
          console.warn('Canceling network change in the app, wallet network change request failed!');
        }
      }

      onClose();
    },
    [unsupportedNetwork, onClose, requestNetworkChange, requestAddNetwork],
  );

  const ethereumSelected = userWalletChain === 'ethereum';
  const fantomSelected = userWalletChain === 'fantom';

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} title="selectNetwork" onClose={onClose}>
      <div className="tc__chainSelectorPopup-content">
        <button
          className={`tc__chainSelectorPopup-button ${ethereumSelected ? 'selected' : ''}`}
          onClick={() => onChainSelect('ethereum')}
        >
          <div className="tc__chainSelectorPopup-button__label">
            <Typography variant="button-text">Ethereum</Typography>
            <Spacer size={12} />
            {ethereumSelected && <TickIcon />}
          </div>
          <TokenIcon ticker="ETH" width={24} height={24} vectorWidth={20} vectorHeight={20} />
        </button>
        <Spacer size={12} />
        <button
          className={`tc__chainSelectorPopup-button ${fantomSelected ? 'selected' : ''}`}
          onClick={() => onChainSelect('fantom')}
        >
          <div className="tc__chainSelectorPopup-button__label">
            <Typography variant="button-text">Fantom</Typography>
            <Spacer size={12} />
            {fantomSelected && <TickIcon />}
          </div>
          <TokenIcon ticker="FANTOM" width={24} height={24} vectorWidth={24} vectorHeight={24} />
        </button>
      </div>
    </Modal>
  );
};
export default ChainSelectorPopup;
