import { FC } from 'react';

import './Loading.scss';

export type LoadingColor = 'default' | 'primary' | 'secondary';

export interface LoadingProps {
  size?: number;
  color?: LoadingColor;
}

const DEFAULT_SIZE = 20;
const DEFAULT_COLOR: LoadingColor = 'default';

const Loading: FC<LoadingProps> = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }) => (
  <svg height={size} width={size} viewBox="0 0 100 100">
    <circle className={`tc__loading tc__loading__color-bg-${color}`} cx="50" cy="50" r="40" />
    <circle className={`tc__loading tc__loading__color-animate-${color} tc__loading__animate`} cx="50" cy="50" r="40" />
  </svg>
);

export default Loading;
