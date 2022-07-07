import { memo } from 'react';
import FadingBlock from '../FadingBlock';
import { FOUNDERS, DEVELOPMENTS, MARKETING_BDS, OPERATIONS } from './profiles';
import TeamMembers from './TeamMembers';

const AllMembers = (): JSX.Element => (
  <div className="tw__team__members">
    <div className="tw__container tw__team__members__container">
      <div className="tw__team__members__header">
        <div className="tw__team__members__header-text">Meet the Tempus Labs team</div>
        <div className="tw__team__members__header-text">
          Tempus Labs has been elected by the Tempus DAO governance as the service provider to lead the project. Tempus
          DAO is a decentralized community of Builders, Creators and Connectors.
        </div>
      </div>
      <div className="tw__team__separator" />
      <TeamMembers title="Founders" members={FOUNDERS} />
      <div className="tw__team__separator" />
      <TeamMembers title="Product Development" members={DEVELOPMENTS} />
      <div className="tw__team__separator" />
      <TeamMembers title="Marketing & Business Development" members={MARKETING_BDS} />
      <div className="tw__team__separator" />
      <TeamMembers title="Operations" members={OPERATIONS} />
      <FadingBlock variant="background1" align="right" offsetX={200} offsetY={200} />
      <FadingBlock variant="background2" align="left" offsetX={200} offsetY={1200} />
      <FadingBlock variant="background3" align="right" offsetX={400} offsetY={2200} />
      <FadingBlock variant="background4" align="left" offsetX={400} offsetY={3200} />
      <FadingBlock variant="background5" align="right" offsetX={200} offsetY={4200} />
      <FadingBlock variant="background6" align="left" offsetX={200} offsetY={5200} />
    </div>
  </div>
);
export default memo(AllMembers);
