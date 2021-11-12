import { FC, useCallback } from 'react';
import { MenuItem, FormControl, Select } from '@material-ui/core';
import { Ticker } from '../../interfaces/Token';
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

const getMenuItems = (value: Ticker | null, tickers: Ticker[]) => {
  const menuItems = tickers.map(ticker => {
    return (
      <MenuItem key={ticker} value={ticker}>
        <div className="tf__token-selector__menu-item">
          <Typography variant="dropdown-text">{ticker}</Typography>
          {ticker !== 'Principals' && ticker !== 'Yields' && (
            <div className="tc__token-selector-ticker-container">
              <TokenIcon ticker={ticker} width={18} height={18} />
            </div>
          )}
        </div>
      </MenuItem>
    );
  });

  if (value === null) {
    menuItems.unshift(
      <MenuItem key="empty" value="empty">
        <Typography variant="dropdown-text">Please select</Typography>
      </MenuItem>,
    );
  }

  return menuItems;
};

const TokenSelector: FC<TokenSelectorProps> = props => {
  const { value, tickers, disabled, onTokenChange } = props;

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
          {getMenuItems(value, tickers)}
        </Select>
      </div>
    </FormControl>
  );
};

export default TokenSelector;
