import { FC } from 'react';
import { Ticker } from 'tempus-core-services';
import TokenIcon from '../../tokenIcon';

import './TokenPairIcon.scss';

interface TokenPairIconProps {
  parentTicker: Ticker;
  childTicker: Ticker;
  hideChild?: boolean;
}

const TokenPairIcon: FC<TokenPairIconProps> = props => {
  const { parentTicker, childTicker, hideChild } = props;

  return (
    <div className="tc__tokenPairIcon-parent">
      <TokenIcon ticker={parentTicker} large />
      {!hideChild && (
        <div className="tf__tokenPairIcon-child">
          <TokenIcon ticker={childTicker} width={27} height={27} />
        </div>
      )}
    </div>
  );
};
export default TokenPairIcon;
