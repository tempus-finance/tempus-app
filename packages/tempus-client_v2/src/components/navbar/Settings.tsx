import { useCallback, useState, useRef, useContext } from 'react';
import { Divider, Popper } from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Languages from './Languages';
import Slippage from './Slippage';
import Button from '../common/Button';
import Typography from '../typography/Typography';

import './Settings.scss';

const Settings = () => {
  const { language } = useContext(LanguageContext);

  const settingsMenuAnchor = useRef<HTMLLIElement>(null);

  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

  const toggleSettingsMenu = useCallback(() => {
    setSettingsMenuOpen(prevValue => !prevValue);
  }, [setSettingsMenuOpen]);

  return (
    <li ref={settingsMenuAnchor}>
      <Button onClick={toggleSettingsMenu}>
        <Typography variant="dropdown-text">{getText('settings', language)}</Typography>
        <KeyboardArrowDown />
      </Button>
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
    </li>
  );
};

export default Settings;
