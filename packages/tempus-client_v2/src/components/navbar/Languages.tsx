import { useCallback, useContext } from 'react';
import { FormControl, MenuItem, Select } from '@material-ui/core';
import { LocaleContext } from '../../context/localeContext';
import getText from '../../localisation/getText';
import { LocaleCode } from '../../interfaces/Locale';
import { getLocaleFromCode } from '../../localisation/SupportedLocales';
import LocaleIcon from '../icons/LocaleIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import './Languages.scss';

const Languages = () => {
  const { locale, setLocale } = useContext(LocaleContext);

  const onChangeLanguage = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const selectedLocale = event.target.value as LocaleCode;

      setLocale &&
        selectedLocale &&
        setLocale({
          locale: getLocaleFromCode(selectedLocale),
        });
    },
    [setLocale],
  );

  return (
    <>
      <Spacer size={15} />
      <div className="tc__header__settings-menu__section-header">
        <LocaleIcon />
        <Spacer size={10} />
        <Typography variant="card-body-text">{getText('language', locale)}</Typography>
      </div>
      <div className="tc__header__settings-menu__section-row">
        <FormControl size="medium" fullWidth>
          <div className="tc__header__settings-menu__language-selector">
            <Select
              fullWidth
              variant="standard"
              labelId="language-selector"
              value={locale.code}
              onChange={onChangeLanguage}
              disableUnderline
            >
              <MenuItem value="en">
                <Typography variant="dropdown-text">English</Typography>
              </MenuItem>
              <MenuItem value="es">
                <Typography variant="dropdown-text">Español</Typography>
              </MenuItem>
              <MenuItem value="it">
                <Typography variant="dropdown-text">Italiano</Typography>
              </MenuItem>
              {process.env.NODE_ENV === 'development' && (
                <MenuItem value="zz">
                  <Typography variant="dropdown-text">Pseudo Locale</Typography>
                </MenuItem>
              )}
            </Select>
          </div>
        </FormControl>
      </div>
    </>
  );
};

export default Languages;
