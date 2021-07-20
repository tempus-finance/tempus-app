import { FC } from 'react';
import { Ticker } from '../../interfaces';
import { tokenIcons } from './tokenIcons';

type IconInProps = {
  ticker: Ticker;
};

const TokenIcon: FC<IconInProps> = ({ ticker }): JSX.Element => {
  return (
    <svg
      aria-hidden="true"
      className="tf-icon"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      role="img"
      dangerouslySetInnerHTML={{ __html: tokenIcons[ticker] }}
    />
  );
};

export default TokenIcon;
