import { FC } from 'react';

import './ContributorAvatar.scss';

interface ContributorAvatarProps {
  name: string;
  x: number;
  y: number;
}

const ContributorAvatar: FC<ContributorAvatarProps> = (props): JSX.Element => {
  const { name, x, y } = props;

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
          backgroundImage: `url('/images/avatars/${name}.jpg')`,
        }}
      />
      <div
        className="tw__contributor-avatar-image"
        style={{
          backgroundImage: `url('/images/avatars/${name}.jpg')`,
        }}
      />
    </div>
  );
};
export default ContributorAvatar;
