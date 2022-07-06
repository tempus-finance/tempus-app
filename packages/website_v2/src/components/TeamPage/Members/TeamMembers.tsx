import { FC, memo } from 'react';
import { Profile } from './profiles';
import ProfileCard from './ProfileCard';

interface TeamMembersProps {
  title: string;
  members: Profile[];
}

const TeamMembers: FC<TeamMembersProps> = ({ title, members }) => (
  <div className="tw__team__members__container">
    <div className="tw__team__members__container-title">
      <div className="tw__team__members__container-title-text">{title}</div>
    </div>
    <div className="tw__team__members__container-content">
      {members.map(member => (
        <ProfileCard key={member.name} profile={member} />
      ))}
    </div>
  </div>
);
export default memo(TeamMembers);
