import { useCallback, useState, useRef, useContext } from 'react';
import { Divider, Popper } from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Languages from './Languages';
import Slippage from './Slippage';

import './Settings.scss';

const Settings = () => {
  const { language } = useContext(LanguageContext);

  const settingsMenuAnchor = useRef<HTMLLIElement>(null);

  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

  const toggleSettingsMenu = useCallback(() => {
    setSettingsMenuOpen(prevValue => !prevValue);
  }, [setSettingsMenuOpen]);

  return (
    <>
      <li ref={settingsMenuAnchor} onClick={toggleSettingsMenu}>
        {getText('settings', language)} <KeyboardArrowDown />
      </li>
      <Popper
        className="tc__header__popper"
        open={settingsMenuOpen}
        anchorEl={settingsMenuAnchor.current}
        placement="bottom-end"
      >
        <div className="tc__header__settings-menu__container">
          <Slippage />
          <Divider orientation="horizontal" />
          <Languages />
        </div>
      </Popper>
      {settingsMenuOpen && <div className="tc__backdrop" onClick={toggleSettingsMenu} />}
    </>
  );
};

export default Settings;
