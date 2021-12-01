import { useCallback, useState, useRef, useContext } from 'react';
import { Divider, FormControl, MenuItem, Popper, Select } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText, { Language } from '../../localisation/getText';
import SlippageIcon from '../icons/SlippageIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import InfoTooltip from '../infoTooltip/infoTooltip';
import PercentageInput from '../percentageInput/percentageInput';

import './Settings.scss';
import LanguageIcon from '../icons/LanguageIcon';

// TODO
// style mouse over
// check icon with design

const Settings = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { slippage, setUserSettings } = useContext(UserSettingsContext);

  const settingsMenuAnchor = useRef<HTMLLIElement>(null);

  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

  const onChangeLanguage = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const selectedLanguage = event.target.value as Language;

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

  const onSlippageChange = useCallback(
    (value: string) => {
      if (value !== '') {
        setUserSettings &&
          setUserSettings(prevState => ({
            ...prevState,
            slippage: Number(value),
          }));
      }
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
          <div className="tc__header__settings-menu-section-row">
            <PercentageInput defaultValue={slippage.toString()} onChange={onSlippageChange} />
          </div>
          <Spacer size={15} />
          <Divider orientation="horizontal" />
          <Spacer size={15} />
          <div className="tc__header__settings-menu__section-header">
            <LanguageIcon />
            <Spacer size={10} />
            <Typography variant="card-body-text">{getText('language', language)}</Typography>
          </div>
          <div className="tc__header__settings-menu__section-row">
            <FormControl size="medium" fullWidth>
              <div className="tc__header__settings-menu__language-selector">
                <Select
                  fullWidth
                  variant="standard"
                  labelId="language-selector"
                  value={language}
                  onChange={onChangeLanguage}
                  disableUnderline
                >
                  <MenuItem value="en">
                    <Typography variant="dropdown-text">English</Typography>
                  </MenuItem>
                  <MenuItem value="it">
                    <Typography variant="dropdown-text">Italiano</Typography>
                  </MenuItem>
                </Select>
              </div>
            </FormControl>
          </div>
        </div>
      </Popper>
      {settingsMenuOpen && <div className="tc__backdrop" onClick={toggleSettingsMenu} />}
    </>
  );
};

export default Settings;
