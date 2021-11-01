import { FC, useMemo } from 'react';
import { Ticker } from '../../interfaces/Token';
import { ProtocolName } from '../../interfaces/ProtocolName';
import { tokenIcons } from './tokenIcons';

import './tokenIcon.scss';

type IconInProps = {
  ticker: Ticker;
  width?: number;
  height?: number;
};

const TokenIcon: FC<IconInProps> = ({ ticker, width, height }): JSX.Element => {
  const icon = useMemo(() => tokenIcons[ticker], [ticker]);
  const __html = useMemo(() => `<title>${ticker}</title>${icon}`, [ticker, icon]);

  return icon ? (
    <svg
      aria-hidden="true"
      className="tf__token__icon"
      width={width || 24}
      height={height || 24}
      viewBox="0 0 32 32"
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
