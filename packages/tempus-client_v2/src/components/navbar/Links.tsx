import { useCallback, useContext } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState } from '../../state/PoolDataState';
import { LanguageContext } from '../../context/languageContext';
import getText /*, { Language }*/ from '../../localisation/getText';
import Community from './Community';

import './Links.scss';

const Links = () => {
  const selectedPool = useHookState(selectedPoolState);

  const { language /*setLanguage*/ } = useContext(LanguageContext);

  // Implement language selector once the design for it is finalized.
  /*const onChangeLanguage = useCallback(
    (selectedLanguage: Language) => {
      setLanguage &&
        setLanguage({
          language: selectedLanguage,
        });
    },
    [setLanguage],
  );*/

  const onDashboardClick = useCallback(() => {
    selectedPool.set('');
  }, [selectedPool]);

  // TODO
  // link active state

  return (
    <div className="tc__navBar__links">
      <ul>
        <li onClick={onDashboardClick}>{getText('dashboard', language)}</li>
        {/* <li>{getText('analytics', language)}</li> */}
        <Community />
        {/*<li>{getText('settings', language)}</li>*/}
      </ul>
    </div>
  );
};

export default Links;
