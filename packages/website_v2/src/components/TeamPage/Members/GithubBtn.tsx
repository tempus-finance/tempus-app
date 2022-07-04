import { FC } from 'react';
import { Link } from '../../shared/';

const GithubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 0C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H9.05296C9.16455 23.8936 9.20477 23.7529 9.20477 23.5988C9.20477 23.4668 9.20269 23.238 9.1999 22.9331C9.19643 22.5522 9.19186 22.0524 9.18893 21.4738C5.65109 22.2274 4.90493 19.7972 4.90493 19.7972C4.32629 18.3548 3.48989 17.9689 3.48989 17.9689C2.33789 17.1941 3.57893 17.21 3.57893 17.21C4.85621 17.2969 5.52701 18.4978 5.52701 18.4978C6.66101 20.4087 8.50421 19.8567 9.23141 19.5375C9.34589 18.7287 9.67349 18.1786 10.0369 17.8661C7.21229 17.5534 4.24349 16.4787 4.24349 11.6902C4.24349 10.3261 4.73645 9.21126 5.55245 8.33669C5.40941 8.02085 4.98005 6.75005 5.66381 5.02878C5.66381 5.02878 6.72893 4.69374 9.16133 6.31013C10.1789 6.03245 11.2599 5.89469 12.3411 5.88822C13.4223 5.89445 14.5033 6.03245 15.5209 6.31013C17.9374 4.69374 19.0025 5.02878 19.0025 5.02878C19.6861 6.75005 19.2569 8.02085 19.1297 8.33669C19.9405 9.21101 20.4334 10.3261 20.4334 11.6902C20.4334 16.4914 17.4605 17.5481 14.6305 17.8556C15.0757 18.2307 15.4889 18.997 15.4889 20.1682C15.4889 21.2888 15.4818 22.2619 15.4771 22.9042C15.4748 23.2206 15.4731 23.4567 15.4731 23.5906C15.4731 23.7493 15.5063 23.8935 15.6238 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0H4Z"
      fill="#EEECFF"
    />
  </svg>
);

interface BtnProps {
  url?: string;
}

const GithubBtn: FC<BtnProps> = props => {
  const { url } = props;

  if (!url) return null;

  return (
    <Link href={url}>
      <GithubIcon />
    </Link>
  );
};

export default GithubBtn;
