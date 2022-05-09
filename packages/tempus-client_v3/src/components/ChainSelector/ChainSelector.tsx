import { FC, memo, useCallback } from 'react';
import { useSetChain } from '@web3-onboard/react';
import {
  Chain,
  chainNameToHexChainId,
  ethereumChainIdHex,
  ethereumForkChainIdHex,
  fantomChainIdHex,
} from 'tempus-core-services';
import { Modal, SwitcherButton } from '../shared';

import './ChainSelector.scss';

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
    <div className="tc__chainSelector">
      <Modal title="Select Network" open={open} onClose={onClose}>
        <SwitcherButton
          label="Ethereum"
          logoType="token-ETH"
          selected={connectedChain.id === ethereumChainIdHex}
          onClick={() => onNetworkClick('ethereum')}
        />
        <SwitcherButton
          label="Fantom"
          logoType="token-FTM"
          selected={connectedChain.id === fantomChainIdHex}
          onClick={() => onNetworkClick('fantom')}
        />
        <SwitcherButton
          label="Ethereum Fork"
          logoType="token-ETH"
          selected={connectedChain.id === ethereumForkChainIdHex}
          onClick={() => onNetworkClick('ethereum-fork')}
        />
      </Modal>
    </div>
  );
};
export default memo(ChainSelector);
