import { useContext } from 'react';
import { Downgraded, useState as useHookState } from '@hookstate/core';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import { selectedChainState } from '../../state/ChainState';
import ChainIcon from '../icons/ChainIcon';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';

import './ChainSelector.scss';

const ChainSelector = () => {
  const { language } = useContext(LanguageContext);

  const selectedChain = useHookState(selectedChainState);

  const selectedChainName = selectedChain.attach(Downgraded).get();

  return (
    <div className="tc__chainSelector">
      {!selectedChainName && (
        <>
          <ChainIcon />
          <Spacer size={4} />
          {/* TODO - Update typography style once new fonts are merged into 2.0 branch */}
          <Typography variant="body-text">{getText('selectNetwork', language)}</Typography>
        </>
      )}
    </div>
  );
};
export default ChainSelector;
