import { FC, ChangeEvent, useCallback, useEffect, useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Ticker } from '../../interfaces/Token';
import TokenIcon from '../tokenIcon';
import Typography from '../typography/Typography';

import './tokenSelector.scss';

type TokenSelectorInProps = {
  defaultTicker?: Ticker;
  tickers?: Ticker[];
  classNames?: string;
  disabled?: boolean;
};

type TokenSelectorOutProps = {
  onTokenChange?: (token: Ticker | undefined) => void;
};

type TokenSelectorProps = TokenSelectorInProps & TokenSelectorOutProps;

const getMenuItems = (items: string[]) => {
  return items.map((item: string) => {
    return (
      <MenuItem key={item} value={item} className="tf__token-selector__menu-item__container">
        <div className="tf__token-selector__menu-item">
          {item !== 'empty' && (
            <>
              <Typography variant="dropdown-text">{item}</Typography>
              <div className="tc__token-selector-ticker-container">
                <TokenIcon ticker={item as Ticker} width={18} height={18} />
              </div>
            </>
          )}
          {item === 'empty' && <Typography variant="dropdown-text">Please select</Typography>}
        </div>
      </MenuItem>
    );
  });
};

const TokenSelector: FC<TokenSelectorProps> = ({
  disabled,
  defaultTicker,
  tickers = [],
  classNames,
  onTokenChange,
}) => {
  const [items, setItems] = useState<string[]>([]);
  const [token, setToken] = useState<string>('empty');

  useEffect(() => {
    if (defaultTicker && defaultTicker !== token) {
      setToken(defaultTicker);
    }
  }, [defaultTicker, token, setToken]);

  useEffect(() => {
    if (tickers && tickers.length && items.length === 0) {
      if (!defaultTicker) {
        setItems([...tickers, 'empty']);
      } else {
        setItems([...tickers]);
      }
    }
  }, [tickers, defaultTicker, items, setItems]);

  const handleChange = useCallback(
    (event: ChangeEvent<{ value: unknown }>) => {
      const newToken = event.target.value as Ticker;
      setToken(newToken);

      setItems([...tickers]);

      if (onTokenChange) {
        onTokenChange(newToken);
      }
    },
    [tickers, setToken, setItems, onTokenChange],
  );

  return (
    <FormControl size="medium">
      <div className="tc__token-selector-container">
        <Select
          variant="standard"
          labelId="tf__token-selector"
          value={token}
          disabled={disabled}
          onChange={handleChange}
          disableUnderline
        >
          {getMenuItems(items)}
        </Select>
      </div>
    </FormControl>
  );
};

export default TokenSelector;
