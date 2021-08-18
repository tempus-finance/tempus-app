import { FC, useMemo } from 'react';
import { Ticker } from '../../interfaces';
import { tokenIcons } from './tokenIcons';

type IconInProps = {
  ticker: Ticker;
};

const TokenIcon: FC<IconInProps> = ({ ticker }): JSX.Element => {
  const __html = useMemo(() => `<title>${ticker}</title>${tokenIcons[ticker]}`, [ticker]);

  return (
    <svg
      aria-hidden="true"
      className="tf-icon"
      width={24}
      height={24}
      viewBox="0 0 32 32"
      role="img"
      dangerouslySetInnerHTML={{ __html }}
    ></svg>
  );
};

export default TokenIcon;
