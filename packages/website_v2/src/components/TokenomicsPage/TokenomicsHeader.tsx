import { memo } from 'react';
import Header from '../Header';

const TokenomicsHeader = (): JSX.Element => (
  <div className="tw__tokenomics__header">
    <div className="tw__tokenomics__header__background-container">
      <div className="tw__tokenomics__header__background" />
    </div>
    <Header color="transparent" />
    <div className="tw__tokenomics__header__title">
      <span className="tw__tokenomics__header__title-text">Own a slice of</span>
      <span className="tw__tokenomics__header__title-text">DeFi innovation</span>
    </div>
  </div>
);

export default memo(TokenomicsHeader);
