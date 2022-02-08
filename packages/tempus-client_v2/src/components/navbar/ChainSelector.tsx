import { useCallback, useContext, useState } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import { selectedChainState } from '../../state/ChainState';
import { chainToTicker, prettifyChainNameLong } from '../../interfaces/Chain';
import ChainIcon from '../icons/ChainIcon';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';
import ChainSelectorPopup from './ChainSelectorPopup';
import TokenIcon from '../tokenIcon';

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
            <Typography variant="h5">{getText('selectNetwork', language)}</Typography>
          </>
        )}
        {selectedChainName && (
          <>
            <TokenIcon
              ticker={chainToTicker(selectedChainName)}
              width={20}
              height={20}
              // TODO - Clean up during TokenIcon refactor
              // 1. Remove small/large icons - we only need one size
              // 2. Store original svg size for each icon
              // 3. Use original size for svg viewport size
              // 4. Set desired width and height for UI
              vectorWidth={selectedChainName === 'ethereum' ? 20 : 24}
              vectorHeight={selectedChainName === 'ethereum' ? 20 : 24}
            />
            <Spacer size={4} />
            {/* TODO - Update typography style once new fonts are merged into 2.0 branch */}
            <Typography variant="h5">{prettifyChainNameLong(selectedChainName)}</Typography>
          </>
        )}
      </div>
      <ChainSelectorPopup open={open} onClose={onClosePopup} />
    </>
  );
};
export default ChainSelector;
