import { useCallback } from 'react';
import { discordInviteLink } from '../../constants';
import ContributorAvatar from './ContributorAvatar/ContributorAvatar';

import './Hero.scss';

const Hero = (): JSX.Element => {
  const handleOnBuildWithUsClick = useCallback(() => {
    window.open(discordInviteLink, '_blank');
  }, []);

  return (
    <div className="tw__hero">
      <h1 className="tw__hero-title-faded">Tempus is shaping the</h1>
      <h1 className="tw__hero-title">future of Web3</h1>
      <button type="button" className="tw__hero-button" onClick={handleOnBuildWithUsClick}>
        BUILD WITH US
      </button>
      <div className="tw__hero-banner">
        <div className="tw__hero-banner-stripes" />
        <ContributorAvatar
          avatarName="avatar-1"
          name="0xWL"
          title="Community Member"
          description="Has had an excellent influence on the community."
          x={8}
          y={7}
        />
        <ContributorAvatar
          avatarName="avatar-2"
          name="0xWL"
          title="Community Member"
          description="Has had an excellent influence on the community."
          x={14}
          y={216}
        />
        <ContributorAvatar
          avatarName="avatar-3"
          name="0xWL"
          title="Community Member"
          description="Has had an excellent influence on the community."
          x={25}
          y={28}
        />
        <ContributorAvatar
          avatarName="avatar-1"
          name="0xWL"
          title="Community Member"
          description="Has had an excellent influence on the community."
          x={37}
          y={79}
        />
        <ContributorAvatar
          avatarName="avatar-2"
          name="0xWL"
          title="Community Member"
          description="Has had an excellent influence on the community."
          x={73}
          y={166}
        />
        <ContributorAvatar
          avatarName="avatar-3"
          name="0xWL"
          title="Community Member"
          description="Has had an excellent influence on the community."
          x={84}
          y={411}
        />
      </div>
    </div>
  );
};
export default Hero;
