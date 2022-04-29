import { FC } from 'react';

import './PoolCardRipples.scss';

interface PoolCardRipplesProps {
  color: string;
}

const PoolCardRipples: FC<PoolCardRipplesProps> = props => {
  const { color } = props;

  const circleStyle = { backgroundColor: color };

  return (
    <>
      <div className="tc__poolCardRipples">
        <div className="tc__poolCardRipples-circle-1" style={circleStyle} />
        <div className="tc__poolCardRipples-circle-2" style={circleStyle} />
        <div className="tc__poolCardRipples-circle-3" style={circleStyle} />
        <div className="tc__poolCardRipples-circle-4" style={circleStyle} />
      </div>
      <div className="tc__poolCardRipples-overlay" />
    </>
  );
};
export default PoolCardRipples;
