import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenETHLight: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
      fill="#FEFEFD"
    />
    <path
      d="M20.2154 5.04473V5.05964C20.2303 5.13419 20.2303 5.22366 20.2303 5.31312V16.0636C20.2154 16.1233 20.1706 16.1382 20.1259 16.168C19.8128 16.3171 19.5146 16.4513 19.2014 16.5855C18.769 16.7793 18.3217 16.9881 17.8893 17.1819L16.3237 17.8976C15.8913 18.0915 15.4589 18.2853 15.0414 18.4791C14.5345 18.7177 14.0126 18.9414 13.5056 19.1799C13.0732 19.3738 12.6408 19.5825 12.1935 19.7763C11.8356 19.9404 11.4778 20.0895 11.1348 20.2535C11.105 20.2684 11.0752 20.2833 11.0454 20.2833C11.0305 20.2833 11.0305 20.2833 11.0156 20.2684L11.4181 19.5974C12.1935 18.3151 12.9539 17.0477 13.7293 15.7654C14.5494 14.3936 15.3844 13.0219 16.2044 11.6501C16.9649 10.3827 17.7402 9.11531 18.5007 7.84791C19.0523 6.92346 19.6189 5.99901 20.1706 5.07455C20.1855 5.04473 20.2005 5.02982 20.2005 5H20.2154C20.2005 5.01491 20.2154 5.02982 20.2154 5.04473Z"
      fill="#8A92B2"
    />
    <path
      d="M29.3698 20.2684L29.3847 20.2833L27.1928 21.5805L20.3041 25.6511C20.2743 25.666 20.2445 25.6809 20.2296 25.6958C20.1849 25.6958 20.1849 25.6511 20.1849 25.6362V25.502V16.2873C20.1849 16.2425 20.1849 16.1829 20.1998 16.1382C20.2147 16.0785 20.2594 16.0934 20.3041 16.1084C20.498 16.1978 20.7067 16.2873 20.9006 16.3767C21.4821 16.6451 22.0636 16.9135 22.6451 17.167C23.1521 17.3907 23.6441 17.6292 24.1511 17.8529C24.658 18.0765 25.165 18.3151 25.6719 18.5388C26.1043 18.7326 26.5517 18.9414 26.9841 19.1352C27.4165 19.329 27.8638 19.5378 28.2962 19.7316C28.6391 19.8807 28.9821 20.0447 29.325 20.1938C29.325 20.2386 29.3399 20.2535 29.3698 20.2684Z"
      fill="#454A75"
    />
    <path
      d="M20.2147 34.9553C20.2147 34.9702 20.1998 34.9851 20.1998 35H20.1849C20.1849 34.9702 20.1551 34.9553 20.1402 34.9254C19.2157 33.6282 18.2913 32.3161 17.3668 31.0189C16.4275 29.6918 15.4732 28.3499 14.5338 27.0229C13.6243 25.7406 12.6998 24.4433 11.7903 23.161C11.5517 22.8181 11.3131 22.4901 11.0746 22.1471C11.0597 22.1173 11.0448 22.1024 11.0149 22.0576C11.0597 22.0576 11.0895 22.0875 11.1044 22.1024C12.4016 22.8628 13.6839 23.6233 14.9811 24.3837C16.4722 25.2634 17.9483 26.1431 19.4394 27.0229L20.1998 27.4702C20.2297 27.5 20.2297 27.5298 20.2297 27.5596V34.7465C20.2297 34.8211 20.2297 34.8956 20.2147 34.9553Z"
      fill="#8A92B2"
    />
    <path
      d="M11 20.2982V20.2833C11.4771 20.0746 11.9394 19.8509 12.4165 19.6422C13.0278 19.3589 13.6392 19.0905 14.2505 18.8072C14.7127 18.5984 15.1899 18.3748 15.6521 18.166C16.338 17.8529 17.0089 17.5547 17.6948 17.2416C18.1571 17.0328 18.6193 16.8241 19.0964 16.6004C19.4245 16.4513 19.7674 16.3022 20.0954 16.1531C20.1252 16.1382 20.17 16.1233 20.1849 16.0934C20.1998 16.0934 20.1998 16.1084 20.1849 16.1233V25.5915C20.1849 25.6362 20.17 25.6809 20.1998 25.7107C20.17 25.7555 20.1402 25.7107 20.1252 25.6958C19.9911 25.6213 19.8569 25.5467 19.7227 25.4573C16.8449 23.7575 13.9523 22.0427 11.0746 20.3429C11.0596 20.328 11.0298 20.3131 11 20.2982Z"
      fill="#62688F"
    />
    <path
      d="M29.34 22.0576H29.3549C29.3549 22.0875 29.3251 22.1173 29.3102 22.1471C26.5666 26.0089 23.8231 29.8857 21.0796 33.7475C20.7963 34.1501 20.4981 34.5527 20.2148 34.9553C20.1998 34.9404 20.1998 34.9254 20.1998 34.9105V34.8211V27.5895V27.4553C20.8261 27.0825 21.4374 26.7246 22.0637 26.3519C24.4792 24.9205 26.8947 23.504 29.2953 22.0726C29.3102 22.0875 29.3251 22.0726 29.34 22.0576Z"
      fill="#62688F"
    />
    <path
      d="M20.1998 16.1232V16.0934V16.004V5.17892C20.1998 5.13418 20.1849 5.10436 20.2147 5.05963C23.2416 10.0845 26.2684 15.0944 29.2803 20.1193C29.3101 20.164 29.3549 20.2236 29.3698 20.2833C29.161 20.2087 28.9672 20.1044 28.7734 20.0149C28.5348 19.9105 28.2813 19.7912 28.0427 19.6869C27.8936 19.6123 27.7296 19.5527 27.5805 19.4781C27.327 19.3588 27.0736 19.2545 26.8201 19.1352C26.671 19.0755 26.5219 19.001 26.3728 18.9264L25.3887 18.4791C25.2247 18.4046 25.0606 18.33 24.8817 18.2555L24.166 17.9423C24.0169 17.8827 23.8678 17.8081 23.7187 17.7336L22.7346 17.2863C22.5706 17.2117 22.4066 17.1372 22.2276 17.0626L21.5119 16.7495C21.3479 16.6749 21.1988 16.6004 21.0348 16.5258C20.7515 16.3916 20.4682 16.2574 20.17 16.1382C20.2147 16.1232 20.1998 16.1232 20.1998 16.1232Z"
      fill="#62688F"
    />
  </svg>
);

export default withLogo(TokenETHLight);
