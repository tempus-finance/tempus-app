import { FC } from 'react';
import IconProps from './IconProps';

const CodeIcon: FC<IconProps> = props => {
  return (
    <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.06225 0L0 6.06225L6.06225 12.1245L7.56427 10.6225L3.00404 6.06225L7.56427 1.50202L6.06225 0ZM13.9378 12.1245L20 6.06225L13.9378 0L12.4357 1.50202L16.996 6.06225L12.4357 10.6225L13.9378 12.1245Z"
        fill={props.fillColor || '#222222'}
      />
    </svg>
  );
};
export default CodeIcon;
