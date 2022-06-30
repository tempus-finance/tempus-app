import { useCallback } from 'react';
import { discordInviteLink } from '../../constants';
import ContributorAvatar from './ContributorAvatar/ContributorAvatar';

import './Hero.scss';

const avatars = [
  {
    id: 1,
    avatarName: 'avatar-1',
    name: '0xWL',
    title: 'Community Member',
    description: 'Has had an excellent influence on the community.',
    x: 8,
    y: 7,
  },
  {
    id: 2,
    avatarName: 'avatar-2',
    name: '0xWL',
    title: 'Community Member',
    description: 'Has had an excellent influence on the community.',
    x: 14,
    y: 216,
  },
  {
    id: 3,
    avatarName: 'avatar-3',
    name: '0xWL',
    title: 'Community Member',
    description: 'Has had an excellent influence on the community.',
    x: 25,
    y: 28,
  },
  {
    id: 4,
    avatarName: 'avatar-1',
    name: '0xWL',
    title: 'Community Member',
    description: 'Has had an excellent influence on the community.',
    x: 37,
    y: 79,
  },
  {
    id: 5,
    avatarName: 'avatar-2',
    name: '0xWL',
    title: 'Community Member',
    description: 'Has had an excellent influence on the community.',
    x: 73,
    y: 166,
  },
  {
    id: 6,
    avatarName: 'avatar-3',
    name: '0xWL',
    title: 'Community Member',
    description: 'Has had an excellent influence on the community.',
    x: 84,
    y: 411,
  },
];

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
        {avatars.map(avatar => (
          <ContributorAvatar
            key={avatar.id}
            avatarName={avatar.avatarName}
            name={avatar.name}
            title={avatar.title}
            description={avatar.description}
            x={avatar.x}
            y={avatar.y}
          />
        ))}
      </div>
    </div>
  );
};
export default Hero;
