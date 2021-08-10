import { FC, ChangeEvent, useCallback, useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { Ticker } from '../../interfaces/Token';
import TokenIcon from '../tokenIcon';

import './tokenSelector.scss';

type TokenSelectorInProps = {
  defaultTicker?: Ticker;
  tickers: Ticker[];
  classNames?: string;
};

type TokenSelectorOutProps = {
  onTokenChange?: (token: string | undefined) => void;
};

type TokenSelectorProps = TokenSelectorInProps & TokenSelectorOutProps;

const getMenuItems = (items: string[]) => {
  return items.map((item: string) => {
    return (
      <MenuItem value={item} className="tf__token-selector__menu-item__container">
        <div className="tf__token-selector__menu-item">
          {item !== 'empty' && (
            <>
              <TokenIcon ticker={item as Ticker} />
              {item.toUpperCase()}
            </>
          )}
          {item === 'empty' && 'Please select'}
        </div>
      </MenuItem>
    );
  });
};

const TokenSelector: FC<TokenSelectorProps> = ({ defaultTicker, tickers, classNames, onTokenChange }) => {
  const [items, setItems] = useState(() => {
    if (!defaultTicker) {
      return [...tickers, 'empty'];
    }

    return [...tickers];
  });

  const [token, setToken] = useState<string>(() => {
    return defaultTicker ? (defaultTicker as string) : 'empty';
  });

  const handleChange = useCallback(
    (event: ChangeEvent<{ value: unknown }>) => {
      const newToken = event.target.value as string;
      setToken(newToken);

      setItems([...tickers]);

      if (onTokenChange) {
        onTokenChange(newToken);
      }
    },
    [tickers, setToken, setItems, onTokenChange],
  );

  return (
    <div className="tf__token-selector">
      <FormControl className={classNames}>
        <Select labelId="tf__token-selector" value={token} onChange={handleChange} input={<InputBase />}>
          {getMenuItems(items)}
        </Select>
      </FormControl>
    </div>
  );
};

export default TokenSelector;
