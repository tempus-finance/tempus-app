import { FC } from 'react';

import './apyGraph.scss';

type APYGraphInProps = {
  apy: number;
};

const APYGraph: FC<APYGraphInProps> = ({ apy }: APYGraphInProps) => {
  const className = `tf__dashboard__apy-graph`;

  const apyThresholds = [0, 3, 10, 20, 50];

  return (
    <div className={className}>
      <div className="tf__dashboard__apy-graph__bar-outer">
        {apyThresholds.map((threshold, index) => {
          if (apy * 100 > threshold) {
            return (
              <div
                key={index}
                className={`tf__dashboard__apy-graph__bar-${index + 1} tf__dashboard__apy-graph__bar-active`}
              />
            );
          }
          return <div key={index} className={`tf__dashboard__apy-graph__bar-${index + 1}`} />;
        })}
      </div>
    </div>
  );
};

export default APYGraph;
