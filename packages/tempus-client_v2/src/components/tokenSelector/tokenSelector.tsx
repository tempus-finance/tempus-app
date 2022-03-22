import { FC, useCallback, useContext } from 'react';
import { MenuItem, FormControl, Select } from '@material-ui/core';
import { Ticker } from 'tempus-core-services';
import { LocaleContext } from '../../context/localeContext';
import getText from '../../localisation/getText';
import { Locale } from '../../interfaces/Locale';
import Typography from '../typography/Typography';
import TokenIcon from '../tokenIcon';

import './tokenSelector.scss';

type TokenSelectorInProps = {
  value: Ticker | null;
  tickers: Ticker[];
  disabled?: boolean;
};

type TokenSelectorOutProps = {
  onTokenChange: (token: Ticker) => void;
};

type TokenSelectorProps = TokenSelectorInProps & TokenSelectorOutProps;

const getMenuItems = (value: Ticker | null, tickers: Ticker[], locale: Locale, disabled?: boolean) => {
  const menuItems = tickers.map(ticker => {
    let tickerLabel;
    switch (ticker) {
      case 'Principals':
        tickerLabel = 'Capitals';
        break;
      case 'Yields':
        tickerLabel = 'Yields';
        break;
      default:
        tickerLabel = ticker;
    }
    return (
      <MenuItem key={ticker} value={ticker}>
        <div className="tf__token-selector__menu-item">
          <Typography variant="dropdown-text">{tickerLabel}</Typography>
          {ticker !== 'Principals' && ticker !== 'Yields' && (
            <div className="tc__token-selector-ticker-container">
              <TokenIcon ticker={ticker} />
            </div>
          )}
        </div>
      </MenuItem>
    );
  });

  if (value === null) {
    menuItems.unshift(
      <MenuItem key="empty" value="empty">
        <Typography variant="dropdown-text">{disabled ? '' : getText('selectPlaceholder', locale)}</Typography>
      </MenuItem>,
    );
  }

  return menuItems;
};

const TokenSelector: FC<TokenSelectorProps> = props => {
  const { value, tickers, disabled, onTokenChange } = props;
  const { locale } = useContext(LocaleContext);

  const handleChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      onTokenChange(event.target.value as Ticker);
    },
    [onTokenChange],
  );

  return (
    <FormControl size="medium">
      <div className="tc__token-selector-container">
        <Select
          fullWidth
          variant="standard"
          labelId="tf__token-selector"
          value={value || 'empty'}
          disabled={disabled}
          onChange={handleChange}
          disableUnderline
        >
          {getMenuItems(value, tickers, locale, disabled)}
        </Select>
      </div>
    </FormControl>
  );
};

export default TokenSelector;
