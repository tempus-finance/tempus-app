import { FC, useMemo } from 'react';
import { Ticker } from '../../interfaces/Token';
import { ProtocolName } from '../../interfaces/ProtocolName';
import tokenIconsSmall from './TokenIconsSmall';
import tokenIconsLarge from './TokenIconsLarge';

import './tokenIcon.scss';

type IconInProps = {
  ticker: Ticker;
  large?: boolean;
  width?: number;
  height?: number;
};

const TokenIcon: FC<IconInProps> = ({ ticker, large, width, height }): JSX.Element => {
  const icon = useMemo(() => (large ? tokenIconsLarge[ticker] : tokenIconsSmall[ticker]), [ticker, large]);

  const iconWidth = useMemo(() => {
    if (width) {
      return width;
    }

    return large ? 40 : 20;
  }, [width, large]);
  const iconHeight = useMemo(() => {
    if (height) {
      return height;
    }

    return large ? 40 : 20;
  }, [height, large]);

  const viewBox = useMemo(() => {
    return large ? '0 0 40 40' : '0 0 20 20';
  }, [large]);

  const __html = useMemo(() => `<title>${ticker}</title>${icon}`, [ticker, icon]);

  return icon ? (
    <svg
      aria-hidden="true"
      className={`tc__token__icon ${large ? 'tc__token__icon-large' : ''}`}
      width={iconWidth}
      height={iconHeight}
      viewBox={viewBox}
      role="img"
      dangerouslySetInnerHTML={{ __html }}
    ></svg>
  ) : (
    <></>
  );
};

export default TokenIcon;

export const getTickerFromProtocol = (protocol: ProtocolName): Ticker => {
  if (protocol === 'compound') {
    return 'COMP';
  }

  return protocol.toUpperCase() as Ticker;
};
