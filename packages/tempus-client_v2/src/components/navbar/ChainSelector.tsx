import { useCallback, useContext, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import { selectedChainState } from '../../state/ChainState';
import ChainIcon from '../icons/ChainIcon';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import ChainSelectorPopup from './ChainSelectorPopup';

import './ChainSelector.scss';

const ChainSelector = () => {
  const { language } = useContext(LanguageContext);

  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  const [open, setOpen] = useState<boolean>(false);

  const onOpenPopup = useCallback(() => {
    setOpen(true);
  }, []);

  const onClosePopup = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <div className="tc__chainSelector" onClick={onOpenPopup}>
        {!selectedChainName && (
          <>
            <ChainIcon />
            <Spacer size={4} />
            {/* TODO - Update typography style once new fonts are merged into 2.0 branch */}
            <Typography variant="body-text">{getText('selectNetwork', language)}</Typography>
          </>
        )}
      </div>
      <ChainSelectorPopup open={open} onClose={onClosePopup} />
    </>
  );
};
export default ChainSelector;
