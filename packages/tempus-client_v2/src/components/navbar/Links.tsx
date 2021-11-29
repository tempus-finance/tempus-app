import { useCallback, useContext } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState } from '../../state/PoolDataState';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Community from './Community';
import Settings from './Settings';

import './Links.scss';

const Links = () => {
  const selectedPool = useHookState(selectedPoolState);

  const { language } = useContext(LanguageContext);

  const onDashboardClick = useCallback(() => {
    selectedPool.set('');
  }, [selectedPool]);

  // TODO
  // link active state

  return (
    <div className="tc__navBar__links">
      <ul>
        <li onClick={onDashboardClick}>{getText('dashboard', language)}</li>
        <Community />
        <Settings />
      </ul>
    </div>
  );
};

export default Links;
