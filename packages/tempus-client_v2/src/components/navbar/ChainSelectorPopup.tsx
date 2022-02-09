import { FC, useCallback, useMemo } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { selectedChainState } from '../../state/ChainState';
import { Chain } from '../../interfaces/Chain';
import TickIcon from '../icons/TickIcon';
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

  const ethereumSelected = useMemo(() => selectedChainName === 'ethereum', [selectedChainName]);
  const fantomSelected = useMemo(() => selectedChainName === 'fantom', [selectedChainName]);

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
            <Typography variant="button-text">Ethereum Mainnet</Typography>
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
            <Typography variant="button-text">Fantom Opera</Typography>
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
