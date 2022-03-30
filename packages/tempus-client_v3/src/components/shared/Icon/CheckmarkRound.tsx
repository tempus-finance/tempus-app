import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const CheckmarkRound: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_909_5429)">
      <path
        d="M10.912 5.888C11.0468 6.02429 11.1225 6.20828 11.1225 6.4C11.1225 6.59172 11.0468 6.7757 10.912 6.912L7.712 10.112C7.57571 10.2468 7.39172 10.3225 7.2 10.3225C7.00828 10.3225 6.8243 10.2468 6.688 10.112L5.088 8.512C4.9746 8.3722 4.91701 8.19535 4.92635 8.01558C4.93569 7.83581 5.01131 7.66588 5.1386 7.53859C5.26588 7.41131 5.43581 7.33569 5.61558 7.32635C5.79535 7.317 5.97221 7.37459 6.112 7.488L7.2 8.584L9.888 5.888C10.0243 5.75316 10.2083 5.67753 10.4 5.67753C10.5917 5.67753 10.7757 5.75316 10.912 5.888ZM16 8C16 9.58225 15.5308 11.129 14.6518 12.4446C13.7727 13.7602 12.5233 14.7855 11.0615 15.391C9.59966 15.9965 7.99113 16.155 6.43928 15.8463C4.88743 15.5376 3.46197 14.7757 2.34315 13.6569C1.22433 12.538 0.462403 11.1126 0.153721 9.56072C-0.15496 8.00887 0.00346627 6.40034 0.608967 4.93853C1.21447 3.47672 2.23985 2.22729 3.55544 1.34824C4.87103 0.469192 6.41775 0 8 0C9.05058 0 10.0909 0.206926 11.0615 0.608964C12.0321 1.011 12.914 1.60028 13.6569 2.34315C14.3997 3.08601 14.989 3.96793 15.391 4.93853C15.7931 5.90914 16 6.94942 16 8ZM14.4 8C14.4 6.7342 14.0246 5.49682 13.3214 4.44435C12.6182 3.39188 11.6186 2.57157 10.4492 2.08717C9.27973 1.60277 7.9929 1.47603 6.75142 1.72297C5.50995 1.96992 4.36958 2.57946 3.47452 3.47452C2.57946 4.36957 1.96992 5.50994 1.72298 6.75142C1.47603 7.9929 1.60277 9.27973 2.08717 10.4492C2.57158 11.6186 3.39188 12.6182 4.44435 13.3214C5.49683 14.0246 6.7342 14.4 8 14.4C9.69739 14.4 11.3253 13.7257 12.5255 12.5255C13.7257 11.3252 14.4 9.69738 14.4 8Z"
        fill="#062330"
      />
    </g>
    <defs>
      <clipPath id="clip0_909_5429">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default withIcon(CheckmarkRound);
