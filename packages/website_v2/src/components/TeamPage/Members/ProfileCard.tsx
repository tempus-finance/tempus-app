import { FC } from 'react';

import { Profile } from './profiles';
import GithubBtn from './GithubBtn';
import LinkedInBtn from './LinkedInBtn';
import ProfilePic from './ProfilePic';
import TwitterBtn from './TwitterBtn';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: FC<ProfileCardProps> = ({ profile }) => {
  const { name, avatar, title, twitter, linkedIn, github, desc, isBuilder, isCreator, isConnector } = profile;

  return (
    <div className="tw__team__members__profile">
      <div className="tw__team__members__profile-role">
        {isCreator && <div className="tw__team__members__profile-role-creator">Creator</div>}
        {isConnector && <div className="tw__team__members__profile-role-connector">Connector</div>}
        {isBuilder && <div className="tw__team__members__profile-role-builder">Builder</div>}
      </div>
      <ProfilePic url={avatar} />
      <div className="tw__team__members__profile-name">{name}</div>
      <div className="tw__team__members__profile-title">{title}</div>
      <div className="tw__team__members__profile-desc">{desc}</div>
      <div className="tw__team__members__profile-social">
        <TwitterBtn url={twitter} />
        <LinkedInBtn url={linkedIn} />
        <GithubBtn url={github} />
      </div>
    </div>
  );
};

export default ProfileCard;
