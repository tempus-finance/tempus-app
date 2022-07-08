import { memo } from 'react';
import Header from '../Header';

const TokenHeader = (): JSX.Element => (
  <div className="tw__token__header">
    <div className="tw__token__header__background-container">
      <div className="tw__token__header__background" />
    </div>
    <Header color="transparent" iconColor="#050A4A" />
    <div className="tw__token__header__title">
      <span className="tw__token__header__title-text">Own a slice of</span>
      <span className="tw__token__header__title-text">DeFi innovation</span>
    </div>
  </div>
);

export default memo(TokenHeader);
