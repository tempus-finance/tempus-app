import { FC, useMemo } from 'react';
import { ProtocolName, Ticker } from 'tempus-core-services';
import tokenIconsSmall from './TokenIconsSmall';
import tokenIconsLarge from './TokenIconsLarge';

import './tokenIcon.scss';

type IconInProps = {
  ticker: Ticker;
  large?: boolean;
  width?: number;
  height?: number;
  // Viewbox should always be original svg size, width and height attributes then scale the svg.
  // This is a quick fix that allows us to specify original svg size in addition to width and height of final svg in the UI.
  // TODO - Remove small and large svg versions, we only need one, and proper with, height and view box params.
  vectorWidth?: number;
  vectorHeight?: number;
};

const TokenIcon: FC<IconInProps> = ({ ticker, large, width, height, vectorWidth, vectorHeight }): JSX.Element => {
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
    if (vectorWidth && vectorHeight) {
      return `0 0 ${vectorWidth} ${vectorHeight}`;
    }

    if (height && width) {
      return `0 0 ${height} ${width}`;
    }

    return large ? '0 0 40 40' : '0 0 20 20';
  }, [vectorWidth, vectorHeight, height, width, large]);

  const __html = useMemo(() => `<title>${ticker}</title>${icon}`, [ticker, icon]);

  return icon ? (
    <svg
      aria-hidden="true"
      className={`tc__token__icon ${large ? 'tc__token__icon-large' : ''}`}
      width={`${iconWidth}px`}
      height={`${iconHeight}px`}
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
