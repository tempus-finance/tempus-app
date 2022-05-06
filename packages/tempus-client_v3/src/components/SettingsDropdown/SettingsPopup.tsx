import { ChangeEvent, FC, memo, useCallback } from 'react';
import { Decimal } from 'tempus-core-services';
import { SUPPORTED_LOCALE_NAMES, SupportedLocale, useLocale, useUserPreferences } from '../../hooks';
import {
  DropdownSelectableItem,
  DropdownSelector,
  SlippageInput,
  Icon,
  InfoTooltip,
  ToggleSwitch,
  Typography,
} from '../shared';

const SettingsPopup: FC = () => {
  const [locale, setLocale] = useLocale();
  const [preference, setPreferences] = useUserPreferences();

  const handleLocaleChange = useCallback((code: string) => setLocale(code as SupportedLocale), [setLocale]);
  const handleChangeDark = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => setPreferences({ darkmode: ev.target.checked }),
    [setPreferences],
  );
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
          Slippage tolerance
        </Typography>
        <InfoTooltip
          tooltipContent="Your transaction will revert if the price changes unfavorably by more than this percentage."
          iconSize="small"
        />
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
          Language
        </Typography>
        <DropdownSelector label={SUPPORTED_LOCALE_NAMES[locale]} selectedValue={locale} onSelect={handleLocaleChange}>
          {Object.entries(SUPPORTED_LOCALE_NAMES).map(([code, name]) => (
            <DropdownSelectableItem key={code} label={name} value={code} />
          ))}
        </DropdownSelector>
      </li>
      <li className="tc__settings-popup-item">
        <Icon variant="dark" size={20} />
        <Typography className="tc__settings-popup-item-title" variant="body-primary" weight="medium">
          Dark Theme
        </Typography>
        <ToggleSwitch checked={preference.darkmode} onChange={handleChangeDark} />
      </li>
    </ul>
  );
};

export default memo(SettingsPopup);
