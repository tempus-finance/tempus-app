import React, { FC } from 'react';
import './Loading.scss';

type LoadingVariant = 'light' | 'dark';

interface LoadingProps {
  variant?: LoadingVariant;
}

const Loading: FC<LoadingProps> = props => {
  const { variant = 'dark' } = props;

  return (
    <svg height="50" width="50" viewBox="0 0 100 100">
      <circle className={`tw__loading tw__loading__color-bg-${variant}`} cx="50" cy="50" r="40" />
      <circle
        className={`tw__loading tw__loading__color-animate-${variant} tw__loading__animate`}
        cx="50"
        cy="50"
        r="40"
      />
    </svg>
  );
};

export default React.memo(Loading);
