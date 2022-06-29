import { FC } from 'react';

import './ContributorAvatar.scss';

interface ContributorAvatarProps {
  avatarName: string;
  name: string;
  title: string;
  description: string;
  x: number;
  y: number;
}

const ContributorAvatar: FC<ContributorAvatarProps> = (props): JSX.Element => {
  const { avatarName, name, title, description, x, y } = props;

  return (
    <div
      className="tw__contributor-avatar"
      style={{
        left: `${x}%`,
        bottom: `${y}px`,
      }}
    >
      <div
        className="tw__contributor-avatar-image-blur"
        style={{
          backgroundImage: `url('/images/avatars/${avatarName}.jpg')`,
        }}
      />
      <div
        className="tw__contributor-avatar-image"
        style={{
          backgroundImage: `url('/images/avatars/${avatarName}.jpg')`,
        }}
      />
      <div className="tw__contributor-avatar-info">
        <div className="tw__contributor-avatar-info-name">Ser {name}</div>
        <div className="tw__contributor-avatar-info-title">{title}</div>
        <div className="tw__contributor-avatar-info-description">{description}</div>
      </div>
    </div>
  );
};
export default ContributorAvatar;
