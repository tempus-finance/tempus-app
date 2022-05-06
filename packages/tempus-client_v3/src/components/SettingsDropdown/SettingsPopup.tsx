import { FC, memo, useCallback, useState } from 'react';
import { Decimal } from 'tempus-core-services';
import { SUPPORTED_LOCALE_NAMES, SupportedLocale, useLocale } from '../../hooks';
import { DropdownSelectableItem, DropdownSelector, Icon, InfoTooltip, ToggleSwitch, Typography } from '../shared';
import SlippageInput from '../shared/SlippageInput';

const SettingsPopup: FC = () => {
  const [locale, setLocale] = useLocale();
  // TODO: use state management instead of local state
  const [slippage, setSlippage] = useState<Decimal>(new Decimal(0));
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  const handleLocaleChange = useCallback((code: string) => setLocale(code as SupportedLocale), [setLocale]);
  const handleChangeDark = useCallback(() => setIsDark(prevState => !prevState), []);

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
          percentage={slippage}
          isAuto={isAuto}
          onPercentageUpdate={setSlippage}
          onAutoUpdate={setIsAuto}
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
        <ToggleSwitch checked={isDark} onChange={handleChangeDark} />
      </li>
    </ul>
  );
};

export default memo(SettingsPopup);
