import { memo } from 'react';
import Header from '../Header';

const GovernanceHeader = (): JSX.Element => (
  <div className="tw__governance__header">
    <div className="tw__governance__header__background-container">
      <div className="tw__governance__header__background" />
    </div>
    <Header color="transparent" iconColor="#050A4A" />
    <div className="tw__governance__header__title">
      <span className="tw__governance__header__title-text">Your token.</span>
      <span className="tw__governance__header__title-text">Your voice.</span>
    </div>
  </div>
);

export default memo(GovernanceHeader);
