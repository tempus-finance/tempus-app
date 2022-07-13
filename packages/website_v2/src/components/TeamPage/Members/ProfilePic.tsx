import { FC, memo } from 'react';

const AvatarTemplate = () => (
  <svg width="176" height="176" viewBox="0 0 176 176" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="176" height="176" fill="#F3F7F9" />
    <mask
      id="mask0_405_7603"
      style={{ maskType: 'alpha' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="176"
      height="176"
    >
      <rect width="176" height="176" fill="#F3F7F9" />
    </mask>
    <g mask="url(#mask0_405_7603)">
      <ellipse cx="88.0003" cy="70.8405" rx="38.72" ry="41.36" fill="#7DA0B6" />
      <path
        d="M55.88 112.861C55.88 112.861 66.44 127.601 88.66 127.601C109.34 127.601 121.66 112.861 121.66 112.861C121.66 112.861 137.94 117.701 143.66 124.741C154.88 138.551 157.52 176.001 157.52 176.001H18.48C18.48 176.001 21.8521 138.405 33.44 124.081C41.3533 114.3 55.88 112.861 55.88 112.861Z"
        fill="#7DA0B6"
      />
    </g>
  </svg>
);

interface ProfilePicProps {
  url?: string;
}

const ProfilePic: FC<ProfilePicProps> = ({ url }) => (
  <div className="tw__team__members__profile-pic">{url ? <img src={url} alt="profile pic" /> : <AvatarTemplate />}</div>
);

export default memo(ProfilePic);
