import { FC } from 'react';
import { InnerIconProps } from './IconProps';
import withIcon from './withIcon';

const Menu: FC<InnerIconProps> = ({ size, color }) => (
  <svg
    className="tc__icon tc__icon-menu"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 2C0 1.73478 0.0936505 1.48043 0.260349 1.29289C0.427048 1.10536 0.653141 1 0.888889 1H15.1111C15.3469 1 15.573 1.10536 15.7397 1.29289C15.9064 1.48043 16 1.73478 16 2C16 2.26522 15.9064 2.51957 15.7397 2.70711C15.573 2.89464 15.3469 3 15.1111 3H0.888889C0.653141 3 0.427048 2.89464 0.260349 2.70711C0.0936505 2.51957 0 2.26522 0 2ZM15.1111 7H0.888889C0.653141 7 0.427048 7.10536 0.260349 7.29289C0.0936505 7.48043 0 7.73478 0 8C0 8.26522 0.0936505 8.51957 0.260349 8.70711C0.427048 8.89464 0.653141 9 0.888889 9H15.1111C15.3469 9 15.573 8.89464 15.7397 8.70711C15.9064 8.51957 16 8.26522 16 8C16 7.73478 15.9064 7.48043 15.7397 7.29289C15.573 7.10536 15.3469 7 15.1111 7ZM15.1111 13H0.888889C0.653141 13 0.427048 13.1054 0.260349 13.2929C0.0936505 13.4804 0 13.7348 0 14C0 14.2652 0.0936505 14.5196 0.260349 14.7071C0.427048 14.8946 0.653141 15 0.888889 15H15.1111C15.3469 15 15.573 14.8946 15.7397 14.7071C15.9064 14.5196 16 14.2652 16 14C16 13.7348 15.9064 13.4804 15.7397 13.2929C15.573 13.1054 15.3469 13 15.1111 13Z"
      fill={color}
    />
  </svg>
);

export default withIcon(Menu);
