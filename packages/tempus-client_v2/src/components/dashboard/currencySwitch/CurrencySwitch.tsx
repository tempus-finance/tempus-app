import { MouseEvent, useCallback, useContext, useMemo } from 'react';
import { UserSettingsContext } from '../../../context/userSettingsContext';
import { LanguageContext } from '../../../context/languageContext';
import getText from '../../../localisation/getText';
import Typography from '../../typography/Typography';
import './CurrencySwitch.scss';

type CurrencySwitchOptions = 'fiat' | 'crypto';

const CurrencySwitch = () => {
  const { showFiat, setUserSettings } = useContext(UserSettingsContext);
  const { language } = useContext(LanguageContext);

  const onSwitchClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const label = (event.target as HTMLDivElement).parentElement?.getAttribute('data-id') as CurrencySwitchOptions;
      if (setUserSettings && label) {
        setUserSettings(prevState => {
          if ((label === 'fiat' && !prevState.showFiat) || (label === 'crypto' && prevState.showFiat)) {
            return { ...prevState, showFiat: !prevState.showFiat };
          }

          return { ...prevState, showFiat: prevState.showFiat };
        });
      }
    },
    [setUserSettings],
  );

  const style = useMemo(() => {
    if (showFiat) {
      return { left: 0 };
    }

    return { left: '50%' };
  }, [showFiat]);

  return (
    <div className="tc__switch" onClick={onSwitchClick}>
      <div className="tc__switch__selector" style={style}></div>
      <div className={`tc__switch__label ${showFiat ? 'tc__switch__label-selected' : ''}`} data-id="fiat">
        <Typography variant="body-text" color={showFiat ? 'inverted' : 'default'}>
          {getText('fiat', language)}
        </Typography>
      </div>
      <div className={`tc__switch__label ${showFiat ? '' : 'tc__switch__label-selected'}`} data-id="crypto">
        <Typography variant="body-text" color={showFiat ? 'default' : 'inverted'}>
          {getText('crypto', language)}
        </Typography>
      </div>
    </div>
  );
};

export default CurrencySwitch;
