import { FC, memo, useCallback, useState } from 'react';
import { Decimal } from 'tempus-core-services';
import { DropdownSelectableItem, DropdownSelector, Icon, InfoTooltip, ToggleSwitch, Typography } from '../shared';
import SlippageInput from '../shared/SlippageInput';

// TODO: put this to somewhere else
type LOCALE = 'en' | 'es' | 'it';

const LOCALES: Record<LOCALE, string> = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
};

const SettingsPopup: FC = () => {
  // TODO: use state management instead of local state
  const [slippage, setSlippage] = useState<Decimal>(new Decimal(0));
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [locale, setLocale] = useState<LOCALE>('en');
  const [isDark, setIsDark] = useState<boolean>(false);

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
        <DropdownSelector label={LOCALES[locale]} selectedValue={locale} onSelect={setLocale}>
          {Object.entries(LOCALES).map(([value, label]) => (
            <DropdownSelectableItem key={value} label={label} value={value} />
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
