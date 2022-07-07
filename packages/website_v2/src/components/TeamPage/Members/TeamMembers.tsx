import { FC, memo } from 'react';
import { Profile } from './profiles';
import ProfileCard from './ProfileCard';

interface TeamMembersProps {
  title: string;
  members: Profile[];
}

const TeamMembers: FC<TeamMembersProps> = ({ title, members }) => (
  <div className="tw__team__members__section">
    <div className="tw__team__members__section-title">
      <div className="tw__team__members__section-title-text">{title}</div>
    </div>
    <div className="tw__team__members__section-content">
      {members.map(member => (
        <ProfileCard key={member.name} profile={member} />
      ))}
    </div>
  </div>
);
export default memo(TeamMembers);
