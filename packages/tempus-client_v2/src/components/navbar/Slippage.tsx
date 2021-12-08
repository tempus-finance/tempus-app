import { useCallback, useState, useContext, useEffect } from 'react';
import { LanguageContext } from '../../context/languageContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText from '../../localisation/getText';
import SlippageIcon from '../icons/SlippageIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import InfoTooltip from '../infoTooltip/infoTooltip';
import PercentageInput from '../percentageInput/percentageInput';

import './Settings.scss';

const Slippage = () => {
  const { language } = useContext(LanguageContext);
  const { slippage, autoSlippage, setUserSettings } = useContext(UserSettingsContext);
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

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

  const onAutoClick = useCallback(() => {
    setInputDisabled(prev => !prev);
    setUserSettings &&
      setUserSettings(prevState => ({
        ...prevState,
        autoSlippage: !prevState.autoSlippage,
      }));
  }, [setUserSettings]);

  const onInputClick = useCallback(() => {
    setInputDisabled(false);
    setUserSettings &&
      setUserSettings(prevState => ({
        ...prevState,
        autoSlippage: false,
      }));
  }, [setUserSettings]);

  useEffect(() => {
    if (autoSlippage) {
      setInputDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="tc__header__settings-menu__section-header">
        <SlippageIcon />
        <Spacer size={10} />
        <Typography variant="card-body-text">{getText('slippageTolerance', language)}</Typography>
        <div className="tc__header__settings-menu__section-header-action">
          <InfoTooltip text={getText('slippageTooltip', language)} />
        </div>
      </div>
      <div className="tc__header__settings-menu__section-row">
        <PercentageInput
          defaultValue={String(slippage)}
          disabled={inputDisabled}
          autoOn={autoSlippage}
          onChange={onSlippageChange}
          onInputClick={onInputClick}
          onAutoClick={onAutoClick}
        />
      </div>
      <Spacer size={15} />
    </>
  );
};

export default Slippage;
