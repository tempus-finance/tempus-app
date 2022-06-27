import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'tempus-core-services';
import { SUPPORTED_LOCALES, SupportedLocale } from '../../i18n';
import { useLocale, useNegativePoolInterestRates, useUserPreferences } from '../../hooks';
import { DropdownSelectableItem, DropdownSelector, SlippageInput, Icon, InfoTooltip, Typography } from '../shared';

const SettingsPopup: FC = () => {
  const { t } = useTranslation();
  const [locale, setLocale] = useLocale();
  const [preference, setPreferences] = useUserPreferences();
  const negativePoolInterestRates = useNegativePoolInterestRates();

  console.log(negativePoolInterestRates);

  const handleLocaleChange = useCallback((code: string) => setLocale(code as SupportedLocale), [setLocale]);
  const handleSlippageUpdate = useCallback((slippage: Decimal) => setPreferences({ slippage }), [setPreferences]);
  const handleSlippageAutoUpdate = useCallback(
    (slippageAuto: boolean) => setPreferences({ slippageAuto }),
    [setPreferences],
  );

  return (
    <ul className="tc__settings-popup">
      <li className="tc__settings-popup-item">
        <Icon variant="slippage" size={20} />
        <Typography className="tc__settings-popup-item-title" variant="body-primary" weight="medium">
          {t('SettingsPopup.titleSlippage')}
        </Typography>
        <InfoTooltip tooltipContent={t('SettingsPopup.slippageTooltipContent')} iconSize="small" />
        <SlippageInput
          percentage={preference.slippage}
          isAuto={preference.slippageAuto}
          onPercentageUpdate={handleSlippageUpdate}
          onAutoUpdate={handleSlippageAutoUpdate}
        />
      </li>
      <li className="tc__settings-popup-item">
        <Icon variant="globe" size={20} />
        <Typography className="tc__settings-popup-item-title" variant="body-primary" weight="medium">
          {t('SettingsPopup.titleLocale')}
        </Typography>
        <DropdownSelector label={t('SettingsPopup.localeName')} selectedValue={locale} onSelect={handleLocaleChange}>
          {SUPPORTED_LOCALES.map(code => (
            <DropdownSelectableItem key={code} label={t('SettingsPopup.localeName', { lng: code })} value={code} />
          ))}
        </DropdownSelector>
      </li>
    </ul>
  );
};

export default memo(SettingsPopup);
