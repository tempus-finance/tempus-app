import { MouseEvent, useCallback, useContext, useState, useRef } from 'react';
import { List, ListItem, ListItemText, Popper } from '@material-ui/core';
import getText, { Language } from '../../localisation/getText';
import { LanguageContext } from '../../context/languageContext';

import './Settings.scss';

// TODO
// style mouse over
// check icon with design

const Settings = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

  const onChangeLanguage = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const selectedLanguage = (event.target as HTMLDivElement)
        .closest('[role="button"]')
        ?.getAttribute('data-id') as Language;

      setLanguage &&
        selectedLanguage &&
        setLanguage({
          language: selectedLanguage,
        });
    },
    [setLanguage],
  );

  const toggleSettingsMenu = useCallback(() => {
    setSettingsMenuOpen(prevValue => !prevValue);
  }, [setSettingsMenuOpen]);

  const settingsMenuAnchor = useRef<HTMLLIElement>(null);

  return (
    <>
      <li ref={settingsMenuAnchor} onClick={toggleSettingsMenu}>
        {getText('settings', language)}
      </li>
      <Popper
        className="tc__header__popper"
        open={settingsMenuOpen}
        anchorEl={settingsMenuAnchor.current}
        placement="bottom-end"
      >
        <div className="tc__header__settings-menu__container">
          <List>
            <ListItem button onClick={onChangeLanguage} data-id="en">
              <ListItemText primary="English" />
            </ListItem>
            <ListItem button onClick={onChangeLanguage} data-id="it">
              <ListItemText primary="Italiano" />
            </ListItem>
          </List>
        </div>
      </Popper>
      {settingsMenuOpen && <div className="tc__backdrop" onClick={toggleSettingsMenu} />}
    </>
  );
};

export default Settings;
