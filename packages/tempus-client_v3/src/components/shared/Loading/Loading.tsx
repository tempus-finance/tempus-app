import { FC } from 'react';

import './Loading.scss';

interface LoadingProps {
  size?: number;
}

const DEFAULT_SIZE = 20;

const Loading: FC<LoadingProps> = ({ size = DEFAULT_SIZE }) => {
  return (
    <svg height={size} width={size} viewBox="0 0 100 100">
      <circle className="tc__loading tc__loading__bg" cx="50" cy="50" r="40"></circle>
      <circle className="tc__loading tc__loading__animate" cx="50" cy="50" r="40"></circle>
    </svg>
  );
};
export default Loading;
