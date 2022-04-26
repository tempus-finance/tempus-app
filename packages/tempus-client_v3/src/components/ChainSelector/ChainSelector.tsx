import { FC, useCallback } from 'react';
import { useSetChain } from '@web3-onboard/react';
import {
  Chain,
  chainNameToHexChainId,
  ethereumChainIdHex,
  ethereumForkChainIdHex,
  fantomChainIdHex,
} from 'tempus-core-services';
import { Modal, SwitcherButton, Spacer } from '../shared';

interface ChainSelectorProps {
  open: boolean;
  onClose: () => void;
}

const ChainSelector: FC<ChainSelectorProps> = props => {
  const [{ connectedChain }, setChain] = useSetChain();

  const { open, onClose } = props;

  const onNetworkClick = useCallback(
    (chain: Chain) => {
      const hexChainId = chainNameToHexChainId(chain);

      setChain({
        chainId: hexChainId,
      });
    },
    [setChain],
  );

  if (!connectedChain) {
    return null;
  }

  return (
    <Modal title="Select Network" open={open} onClose={onClose}>
      <SwitcherButton
        label="Ethereum"
        logoType="token-ETH"
        selected={connectedChain.id === ethereumChainIdHex}
        onClick={() => onNetworkClick('ethereum')}
      />
      <Spacer size={12} variant="vertical" />
      <SwitcherButton
        label="Fantom"
        logoType="token-FTM"
        selected={connectedChain.id === fantomChainIdHex}
        onClick={() => onNetworkClick('fantom')}
      />
      <Spacer size={12} variant="vertical" />
      <SwitcherButton
        label="Ethereum Fork"
        logoType="token-ETH"
        selected={connectedChain.id === ethereumForkChainIdHex}
        onClick={() => onNetworkClick('ethereum-fork')}
      />
    </Modal>
  );
};
export default ChainSelector;
