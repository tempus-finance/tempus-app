import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const MinusRound: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-minus-round"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_909_5432)">
      <path
        d="M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346627 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 6.94942 15.7931 5.90914 15.391 4.93853C14.989 3.96793 14.3997 3.08601 13.6569 2.34315C12.914 1.60028 12.0321 1.011 11.0615 0.608964C10.0909 0.206926 9.05058 0 8 0ZM8 14.4C6.7342 14.4 5.49683 14.0246 4.44435 13.3214C3.39188 12.6182 2.57158 11.6186 2.08717 10.4492C1.60277 9.27973 1.47603 7.9929 1.72298 6.75142C1.96992 5.50994 2.57946 4.36957 3.47452 3.47452C4.36958 2.57946 5.50995 1.96992 6.75142 1.72297C7.9929 1.47603 9.27973 1.60277 10.4492 2.08717C11.6186 2.57157 12.6182 3.39188 13.3214 4.44435C14.0246 5.49682 14.4 6.7342 14.4 8C14.4 9.69738 13.7257 11.3252 12.5255 12.5255C11.3253 13.7257 9.69739 14.4 8 14.4ZM10.4 8C10.4 8.21217 10.3157 8.41566 10.1657 8.56568C10.0157 8.71571 9.81217 8.8 9.6 8.8H6.4C6.18783 8.8 5.98435 8.71571 5.83432 8.56568C5.68429 8.41566 5.6 8.21217 5.6 8C5.6 7.78783 5.68429 7.58434 5.83432 7.43431C5.98435 7.28428 6.18783 7.2 6.4 7.2H9.6C9.81217 7.2 10.0157 7.28428 10.1657 7.43431C10.3157 7.58434 10.4 7.78783 10.4 8Z"
        fill="#062330"
      />
    </g>
    <defs>
      <clipPath id="clip0_909_5432">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default withIcon(MinusRound);
