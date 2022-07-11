import React, { FC } from 'react';
import './Loading.scss';

const Loading: FC = () => (
  <svg height="50" width="50" viewBox="0 0 100 100">
    <circle className="tw__loading tw__loading__color-bg-default" cx="50" cy="50" r="40" />
    <circle className="tw__loading tw__loading__color-animate-default tw__loading__animate" cx="50" cy="50" r="40" />
  </svg>
);

export default React.memo(Loading);
