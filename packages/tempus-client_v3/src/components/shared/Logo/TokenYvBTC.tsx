import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenYvBTC: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg
    className="tc__logo tc__logo-token-yvBTC"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="20" fill="white" />
    <path
      d="M26.3656 14.4444L25.825 14.9849C27.1149 16.3955 27.8302 18.2377 27.8302 20.1492C27.8302 22.0606 27.1149 23.9028 25.825 25.3134L26.3656 25.854C27.8001 24.298 28.5965 22.2592 28.5965 20.1429C28.5965 18.0265 27.8001 15.9877 26.3656 14.4318V14.4444Z"
      fill="black"
    />
    <path
      d="M14.9973 14.4914C16.4079 13.2016 18.2501 12.4862 20.1615 12.4862C22.073 12.4862 23.9152 13.2016 25.3258 14.4914L25.8663 13.9509C24.3103 12.5164 22.2716 11.72 20.1552 11.72C18.0389 11.72 16.0001 12.5164 14.4441 13.9509L14.9973 14.4914Z"
      fill="black"
    />
    <path
      d="M14.4911 25.318C13.2028 23.9077 12.4884 22.0666 12.4884 20.1565C12.4884 18.2463 13.2028 16.4052 14.4911 14.9949L13.9506 14.4543C12.5161 16.0103 11.7197 18.0491 11.7197 20.1655C11.7197 22.2818 12.5161 24.3206 13.9506 25.8766L14.4911 25.318Z"
      fill="black"
    />
    <path
      d="M25.3188 25.8173C23.9082 27.1071 22.066 27.8224 20.1545 27.8224C18.2431 27.8224 16.4009 27.1071 14.9903 25.8173L14.4498 26.3578C16.0057 27.7923 18.0445 28.5887 20.1609 28.5887C22.2772 28.5887 24.316 27.7923 25.872 26.3578L25.3188 25.8173Z"
      fill="black"
    />
    <path
      d="M23.569 18.3525C23.4608 17.2245 22.4878 16.8461 21.2571 16.7308V15.1776H20.3057V16.702C20.0553 16.702 19.7994 16.702 19.5453 16.702V15.1776H18.6011V16.7417H16.6713V17.7597C16.6713 17.7597 17.374 17.7471 17.3632 17.7597C17.49 17.7458 17.6171 17.7816 17.7179 17.8596C17.8188 17.9375 17.8854 18.0516 17.9038 18.1778V22.4591C17.9011 22.5035 17.8895 22.5471 17.8697 22.587C17.8499 22.6269 17.8223 22.6624 17.7885 22.6915C17.7553 22.7211 17.7166 22.7437 17.6744 22.758C17.6323 22.7722 17.5877 22.7778 17.5434 22.7744C17.5561 22.7852 16.8515 22.7744 16.8515 22.7744L16.6713 23.9114H18.5831V25.5007H19.5345V23.9348H20.2949V25.4934H21.2481V23.9222C22.8554 23.8249 23.9762 23.4285 24.1167 21.9239C24.2303 20.713 23.6608 20.1724 22.7509 19.9544C23.3041 19.6823 23.6464 19.1778 23.569 18.3525ZM22.2356 21.7365C22.2356 22.9186 20.2102 22.7834 19.5652 22.7834V20.686C20.2102 20.6878 22.2356 20.5022 22.2356 21.7365ZM21.7941 18.7814C21.7941 19.8625 20.1039 19.731 19.5669 19.731V17.8246C20.1039 17.8246 21.7941 17.6552 21.7941 18.7814Z"
      fill="black"
    />
    <path
      d="M20.1544 30C18.2077 29.9997 16.3047 29.4221 14.6862 28.3403C13.0677 27.2585 11.8063 25.7211 11.0615 23.9225C10.3166 22.1238 10.1219 20.1447 10.5017 18.2354C10.8816 16.326 11.8191 14.5722 13.1957 13.1957C14.5722 11.8191 16.326 10.8816 18.2354 10.5017C20.1447 10.1219 22.1238 10.3166 23.9225 11.0615C25.7211 11.8063 27.2585 13.0677 28.3403 14.6862C29.4221 16.3047 29.9997 18.2077 30 20.1544C30.0002 21.4475 29.7457 22.7278 29.251 23.9225C28.7563 25.1171 28.0311 26.2025 27.1168 27.1168C26.2025 28.0311 25.1171 28.7563 23.9225 29.251C22.7278 29.7457 21.4475 30.0002 20.1544 30ZM20.1544 11.0801C18.3609 11.0815 16.608 11.6146 15.1174 12.6121C13.6267 13.6095 12.4652 15.0264 11.7797 16.6838C11.0941 18.3412 10.9153 20.1646 11.2658 21.9235C11.6163 23.6825 12.4805 25.2981 13.749 26.5661C15.0174 27.8341 16.6334 28.6976 18.3925 29.0474C20.1516 29.3972 21.9749 29.2177 23.632 28.5315C25.2891 27.8453 26.7056 26.6832 27.7025 25.1922C28.6992 23.7011 29.2317 21.948 29.2324 20.1544C29.2329 18.9624 28.9983 17.7818 28.5423 16.6805C28.0862 15.5791 27.4175 14.5784 26.5744 13.7356C25.7313 12.8928 24.7303 12.2245 23.6287 11.7689C22.5271 11.3132 21.3466 11.0792 20.1544 11.0801Z"
      fill="black"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.6875 6.5625H5.3125V9.6875H9.6875L9.6875 13.4375H12.8125V9.6875V6.5625H9.6875Z"
      fill="#0657F9"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.0804 7.2425C17.411 6.80132 18.8339 6.5625 20.3125 6.5625C27.7338 6.5625 33.75 12.5787 33.75 20C33.75 27.4213 27.7338 33.4375 20.3125 33.4375C12.8912 33.4375 6.875 27.4213 6.875 20C6.875 16.0299 8.59669 12.462 11.3342 10.002L10.4479 6.69436C6.3836 9.71252 3.75 14.5487 3.75 20C3.75 29.1472 11.1653 36.5625 20.3125 36.5625C29.4597 36.5625 36.875 29.1472 36.875 20C36.875 10.8528 29.4597 3.4375 20.3125 3.4375C18.5543 3.4375 16.8601 3.71145 15.2703 4.219L16.0804 7.2425Z"
      fill="#0657F9"
    />
  </svg>
);

export default withLogo(TokenYvBTC);
