import { FC, memo } from 'react';
import { Link } from '../../shared/';

const LinkedInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 0C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0H4ZM5.05714 18.9333H8.48571V9.02857H5.05714V18.9333ZM5 5.75238C5 6.72381 5.78095 7.50476 6.75238 7.50476C7.70476 7.50476 8.48571 6.72381 8.50476 5.75238C8.50476 4.78095 7.72381 4 6.75238 4C5.78095 4 5 4.78095 5 5.75238ZM19.9143 18.9333H19.9333V13.5048C19.9333 10.819 19.381 9.00952 16.2381 9.00952C14.7143 9.00952 13.7429 9.6 13.3238 10.3619H13.2476V9.02857H10.581V18.9333H13.4381V14.0571C13.4381 12.7429 13.7048 11.4857 15.3238 11.4857C16.9048 11.4857 17.0571 12.9714 17.0571 14.1333V18.9333H19.9143Z"
      fill="#EEECFF"
    />
  </svg>
);

interface BtnProps {
  url?: string;
}

const LinkedInBtn: FC<BtnProps> = props => {
  const { url } = props;

  if (!url) return null;

  return (
    <Link href={url}>
      <LinkedInIcon />
    </Link>
  );
};

export default memo(LinkedInBtn);
