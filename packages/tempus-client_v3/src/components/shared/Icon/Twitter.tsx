import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const Twitter: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 3.42342C15.4116 3.66396 14.7795 3.82649 14.115 3.89995C14.8007 3.52145 15.3136 2.92574 15.5582 2.22397C14.914 2.57697 14.209 2.82545 13.4738 2.95859C12.9794 2.47158 12.3245 2.14877 11.6109 2.0403C10.8973 1.93183 10.1648 2.04376 9.52717 2.35871C8.88955 2.67366 8.38247 3.17401 8.08467 3.78209C7.78686 4.39016 7.71499 5.07193 7.88021 5.72154C6.57496 5.66108 5.29807 5.34809 4.13242 4.80288C2.96677 4.25767 1.93841 3.49244 1.11407 2.55683C0.832203 3.0054 0.670131 3.52549 0.670131 4.07938C0.669817 4.578 0.802912 5.069 1.05761 5.50879C1.3123 5.94858 1.68073 6.32357 2.13019 6.60049C1.60893 6.58519 1.09918 6.45524 0.643354 6.22148V6.26048C0.643302 6.95983 0.905511 7.63765 1.38549 8.17894C1.86547 8.72023 2.53365 9.09165 3.27667 9.23017C2.79312 9.3509 2.28615 9.36869 1.79406 9.28218C2.0037 9.88392 2.41205 10.4101 2.96194 10.7871C3.51184 11.1641 4.17575 11.373 4.86074 11.3846C3.69794 12.2268 2.26188 12.6836 0.783581 12.6816C0.521717 12.6816 0.260073 12.6675 0 12.6393C1.50056 13.5294 3.24731 14.0018 5.03127 14C11.0702 14 14.3715 9.38554 14.3715 5.38349C14.3715 5.25347 14.368 5.12215 14.3617 4.99213C15.0038 4.56369 15.5581 4.03315 15.9986 3.42537L16 3.42342Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(Twitter);
