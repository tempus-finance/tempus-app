import React, { FC } from 'react';
import { IconProps } from './index';
import withIcon from './withIcon';

const Scroll: FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.17473 5.20562H2.91263V12.9066C2.91263 14.0654 3.88351 15 5.08737 15H13.8253C15.0291 15 16 14.0654 16 12.9066C16 11.7477 15.0291 10.8131 13.8253 10.8131H13.0874V3.11219C13.0874 1.95334 12.1165 1.01876 10.9126 1H2.17473C0.970878 1 0 1.93458 0 3.11219C0 4.28979 0.970878 5.20562 2.17473 5.20562ZM13.8253 12.215C14.2331 12.215 14.5632 12.5327 14.5632 12.9253C14.5632 13.3179 14.2331 13.6356 13.8253 13.6356H7.14563C7.32035 13.187 7.32035 12.6824 7.14563 12.2337H13.8253V12.215ZM4.3495 2.40187H10.9126C11.3205 2.40187 11.6311 2.71961 11.6505 3.11219V10.8131H4.34953L4.3495 2.40187ZM5.0874 12.215C5.49524 12.215 5.8253 12.5327 5.8253 12.9253C5.8253 13.3179 5.49522 13.6356 5.0874 13.6356C4.67958 13.6356 4.3495 13.3179 4.3495 12.9253C4.3495 12.5327 4.67958 12.215 5.0874 12.215ZM2.17477 2.40187H2.91267V3.11219C2.91267 3.50478 2.58259 3.8225 2.17477 3.8225C1.76695 3.8225 1.43686 3.50476 1.43686 3.11219C1.43686 2.71961 1.76695 2.40187 2.17477 2.40187Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(Scroll);