import { FC } from 'react';
import { Ticker } from '../../interfaces';
import TokenIcon from '../tokenIcon';

import './tokenDescriptor.scss';

type TokenDescriptorInProps = {
  ticker: Ticker;
  description?: string;
};

const TokenDescriptor: FC<TokenDescriptorInProps> = ({ ticker, description }): JSX.Element => {
  return (
    <div className="tf__tokens-returned__name">
      <TokenIcon ticker={ticker} />
      <div className="tf__tokens-returned__ticker">
        <span>{ticker}</span>
        {description && <span className="tf__tokens-returned__name">{description}</span>}
      </div>
    </div>
  );
};

export default TokenDescriptor;
