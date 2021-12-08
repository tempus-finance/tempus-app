import { useCallback, useContext } from 'react';
import { FormControl, MenuItem, Select } from '@material-ui/core';
import { LanguageContext } from '../../context/languageContext';
import getText, { Language } from '../../localisation/getText';
import LanguageIcon from '../icons/LanguageIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import './Languages.scss';

const Languages = () => {
  const { language, setLanguage } = useContext(LanguageContext);

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

  return (
    <>
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
    </>
  );
};

export default Languages;
