import { useCallback, useState, useRef, useContext } from 'react';
import { Popper } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText from '../../localisation/getText';
import SlippageIcon from '../icons/SlippageIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import InfoTooltip from '../infoTooltip/infoTooltip';
import PercentageInput from '../percentageInput/percentageInput';

import './Settings.scss';

// TODO
// style mouse over
// check icon with design

const Settings = () => {
  const { language } = useContext(LanguageContext);
  const { slippage, setUserSettings } = useContext(UserSettingsContext);

  const settingsMenuAnchor = useRef<HTMLLIElement>(null);

  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

  /* TODO - Add new language selector UI */
  /* const onChangeLanguage = useCallback(
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
  ); */

  const toggleSettingsMenu = useCallback(() => {
    setSettingsMenuOpen(prevValue => !prevValue);
  }, [setSettingsMenuOpen]);

  const onSlippageChange = useCallback(
    (value: string) => {
      setUserSettings &&
        setUserSettings(prevState => ({
          ...prevState,
          slippage: Number(value),
        }));
    },
    [setUserSettings],
  );

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
          <div className="tc__header__settings-menu__section-header">
            <SlippageIcon />
            <Spacer size={10} />
            <Typography variant="card-body-text">{getText('slippageTolerance', language)}</Typography>
            <div className="tc__header__settings-menu__section-header-action">
              <InfoTooltip text={getText('slippageTooltip', language)} />
            </div>
          </div>
          <PercentageInput defaultValue={slippage.toString()} onChange={onSlippageChange} />
          {/* TODO - Add new language selector UI */}
          {/* <List>
            <ListItem button onClick={onChangeLanguage} data-id="en">
              <ListItemText primary="English" />
            </ListItem>
            <ListItem button onClick={onChangeLanguage} data-id="it">
              <ListItemText primary="Italiano" />
            </ListItem>
          </List> */}
        </div>
      </Popper>
      {settingsMenuOpen && <div className="tc__backdrop" onClick={toggleSettingsMenu} />}
    </>
  );
};

export default Settings;
