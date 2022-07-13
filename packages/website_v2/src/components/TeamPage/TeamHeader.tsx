import { memo } from 'react';
import Header from '../Header';

const TeamHeader = (): JSX.Element => (
  <div className="tw__team__header">
    <Header color="transparent" menuIconColor="dark" />
    <div className="tw__team__header__title">
      <span className="tw__team__header__title-text">We are shaping the</span>
      <span className="tw__team__header__title-text">future of DeFi</span>
    </div>
  </div>
);
export default memo(TeamHeader);
