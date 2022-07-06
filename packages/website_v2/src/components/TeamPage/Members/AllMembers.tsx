import { FOUNDERS, DEVELOPMENTS, MARKETING_BDS, OPERATIONS } from './profiles';
import TeamMembers from './TeamMembers';

const AllMembers = (): JSX.Element => (
  <div className="tw__team__members">
    <div className="tw__team__members__container">
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
    </div>
  </div>
);
export default AllMembers;
