import { FC, useCallback } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { selectedChainState } from '../../state/ChainState';
import { Chain } from '../../interfaces/Chain';
import Modal from '../modal/Modal';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';

import './ChainSelectorPopup.scss';

interface ChainSelectorPopupProps {
  open: boolean;
  onClose: () => void;
}

const ChainSelectorPopup: FC<ChainSelectorPopupProps> = ({ open, onClose }) => {
  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const onChainSelect = useCallback(
    (chain: Chain) => {
      selectedChain.set(chain);

      onClose();
    },
    [selectedChain, onClose],
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
      </div>
    </Modal>
  );
};
export default ChainSelectorPopup;
