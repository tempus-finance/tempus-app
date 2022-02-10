import { Ticker } from '../../interfaces/Token';

const tokenIconsLarge: { [key in Ticker]?: string } = {
  DAI: `<path d="M20 0C31.0467 0 40 8.95509 40 20C40 31.0467 31.0467 40 20 40C8.95509 40 0 31.0458 0 20C0 8.95509 8.95509 0 20 0Z" fill="#F5AC37"/>
<path d="M20.7403 21.883H28.3399C28.5019 21.883 28.5784 21.883 28.5901 21.6706C28.6522 20.8975 28.6522 20.1199 28.5901 19.3459C28.5901 19.1956 28.5154 19.1335 28.3525 19.1335H13.2279C13.0407 19.1335 12.9903 19.1956 12.9903 19.3711V21.5959C12.9903 21.883 12.9903 21.883 13.29 21.883H20.7403ZM27.7414 16.5333C27.763 16.4766 27.763 16.4145 27.7414 16.3587C27.6145 16.0824 27.4642 15.8187 27.2896 15.5712C27.0268 15.1482 26.7172 14.7585 26.3644 14.4084C26.1979 14.1969 26.0053 14.007 25.7893 13.8459C24.7075 12.9252 23.4214 12.2736 22.039 11.946C21.3415 11.7894 20.6286 11.7147 19.914 11.721H13.2018C13.0146 11.721 12.9894 11.7957 12.9894 11.9586V16.3956C12.9894 16.5828 12.9894 16.6332 13.227 16.6332H27.6514C27.6514 16.6332 27.7765 16.608 27.8017 16.5333H27.7405H27.7414ZM27.7414 24.4831C27.529 24.4597 27.3148 24.4597 27.1024 24.4831H13.2405C13.0533 24.4831 12.9903 24.4831 12.9903 24.7333V29.0714C12.9903 29.2712 12.9903 29.3216 13.2405 29.3216H19.6404C19.9464 29.345 20.2524 29.3234 20.5521 29.2595C21.481 29.1929 22.3945 28.9913 23.2657 28.6591C23.5825 28.5493 23.8885 28.4062 24.1774 28.2343H24.2647C25.765 27.454 26.9836 26.2282 27.7522 24.7234C27.7522 24.7234 27.8395 24.5344 27.7414 24.4849V24.4831ZM10.4783 31.5707V31.496V28.5835V27.5962V24.6586C10.4783 24.4957 10.4783 24.4714 10.2785 24.4714H7.56592C7.41562 24.4714 7.35352 24.4714 7.35352 24.2716V21.8965H10.2533C10.4153 21.8965 10.4783 21.8965 10.4783 21.6841V19.3342C10.4783 19.1839 10.4783 19.147 10.2785 19.147H7.56592C7.41562 19.147 7.35352 19.147 7.35352 18.9472V16.7475C7.35352 16.6098 7.35352 16.5729 7.55332 16.5729H10.2407C10.4279 16.5729 10.4783 16.5729 10.4783 16.3353V9.59786C10.4783 9.39806 10.4783 9.34766 10.7285 9.34766H20.103C20.7835 9.37466 21.4594 9.44936 22.1281 9.57266C23.506 9.82736 24.8299 10.3197 26.0404 11.0226C26.8432 11.4951 27.5821 12.0657 28.24 12.7227C28.735 13.2366 29.1814 13.7928 29.5774 14.385C29.9707 14.9853 30.2974 15.627 30.554 16.2975C30.5855 16.4721 30.7528 16.59 30.9275 16.5603H33.1649C33.452 16.5603 33.452 16.5603 33.4646 16.8357V18.886C33.4646 19.0858 33.3899 19.1362 33.1892 19.1362H31.4639C31.2893 19.1362 31.2389 19.1362 31.2515 19.3612C31.3199 20.1226 31.3199 20.8867 31.2515 21.6481C31.2515 21.8605 31.2515 21.8857 31.49 21.8857H33.4637C33.551 21.9982 33.4637 22.1107 33.4637 22.2241C33.4763 22.369 33.4763 22.5157 33.4637 22.6606V24.1735C33.4637 24.3859 33.4016 24.4489 33.2135 24.4489H30.851C30.6863 24.4174 30.526 24.5227 30.4882 24.6865C29.9257 26.149 29.0257 27.4603 27.8629 28.5115C27.4381 28.8941 26.9917 29.2541 26.5255 29.5862C26.0251 29.8742 25.5382 30.1739 25.0252 30.4115C24.0811 30.8363 23.0911 31.1495 22.075 31.3484C21.1102 31.5212 20.1318 31.5995 19.1499 31.586H10.4747V31.5734L10.4783 31.5707Z" fill="#FEFEFD"/>`,
  yvDAI: `<path d="M20 0C31.0467 0 40 8.95509 40 20C40 31.0467 31.0467 40 20 40C8.95509 40 0 31.0458 0 20C0 8.95509 8.95509 0 20 0Z" fill="#F5AC37"/>
<path d="M20.7403 21.883H28.3399C28.5019 21.883 28.5784 21.883 28.5901 21.6706C28.6522 20.8975 28.6522 20.1199 28.5901 19.3459C28.5901 19.1956 28.5154 19.1335 28.3525 19.1335H13.2279C13.0407 19.1335 12.9903 19.1956 12.9903 19.3711V21.5959C12.9903 21.883 12.9903 21.883 13.29 21.883H20.7403ZM27.7414 16.5333C27.763 16.4766 27.763 16.4145 27.7414 16.3587C27.6145 16.0824 27.4642 15.8187 27.2896 15.5712C27.0268 15.1482 26.7172 14.7585 26.3644 14.4084C26.1979 14.1969 26.0053 14.007 25.7893 13.8459C24.7075 12.9252 23.4214 12.2736 22.039 11.946C21.3415 11.7894 20.6286 11.7147 19.914 11.721H13.2018C13.0146 11.721 12.9894 11.7957 12.9894 11.9586V16.3956C12.9894 16.5828 12.9894 16.6332 13.227 16.6332H27.6514C27.6514 16.6332 27.7765 16.608 27.8017 16.5333H27.7405H27.7414ZM27.7414 24.4831C27.529 24.4597 27.3148 24.4597 27.1024 24.4831H13.2405C13.0533 24.4831 12.9903 24.4831 12.9903 24.7333V29.0714C12.9903 29.2712 12.9903 29.3216 13.2405 29.3216H19.6404C19.9464 29.345 20.2524 29.3234 20.5521 29.2595C21.481 29.1929 22.3945 28.9913 23.2657 28.6591C23.5825 28.5493 23.8885 28.4062 24.1774 28.2343H24.2647C25.765 27.454 26.9836 26.2282 27.7522 24.7234C27.7522 24.7234 27.8395 24.5344 27.7414 24.4849V24.4831ZM10.4783 31.5707V31.496V28.5835V27.5962V24.6586C10.4783 24.4957 10.4783 24.4714 10.2785 24.4714H7.56592C7.41562 24.4714 7.35352 24.4714 7.35352 24.2716V21.8965H10.2533C10.4153 21.8965 10.4783 21.8965 10.4783 21.6841V19.3342C10.4783 19.1839 10.4783 19.147 10.2785 19.147H7.56592C7.41562 19.147 7.35352 19.147 7.35352 18.9472V16.7475C7.35352 16.6098 7.35352 16.5729 7.55332 16.5729H10.2407C10.4279 16.5729 10.4783 16.5729 10.4783 16.3353V9.59786C10.4783 9.39806 10.4783 9.34766 10.7285 9.34766H20.103C20.7835 9.37466 21.4594 9.44936 22.1281 9.57266C23.506 9.82736 24.8299 10.3197 26.0404 11.0226C26.8432 11.4951 27.5821 12.0657 28.24 12.7227C28.735 13.2366 29.1814 13.7928 29.5774 14.385C29.9707 14.9853 30.2974 15.627 30.554 16.2975C30.5855 16.4721 30.7528 16.59 30.9275 16.5603H33.1649C33.452 16.5603 33.452 16.5603 33.4646 16.8357V18.886C33.4646 19.0858 33.3899 19.1362 33.1892 19.1362H31.4639C31.2893 19.1362 31.2389 19.1362 31.2515 19.3612C31.3199 20.1226 31.3199 20.8867 31.2515 21.6481C31.2515 21.8605 31.2515 21.8857 31.49 21.8857H33.4637C33.551 21.9982 33.4637 22.1107 33.4637 22.2241C33.4763 22.369 33.4763 22.5157 33.4637 22.6606V24.1735C33.4637 24.3859 33.4016 24.4489 33.2135 24.4489H30.851C30.6863 24.4174 30.526 24.5227 30.4882 24.6865C29.9257 26.149 29.0257 27.4603 27.8629 28.5115C27.4381 28.8941 26.9917 29.2541 26.5255 29.5862C26.0251 29.8742 25.5382 30.1739 25.0252 30.4115C24.0811 30.8363 23.0911 31.1495 22.075 31.3484C21.1102 31.5212 20.1318 31.5995 19.1499 31.586H10.4747V31.5734L10.4783 31.5707Z" fill="#FEFEFD"/>`,
  ETH: `<path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#627EEA"/>
  <path d="M20.625 5V16.0875L29.9962 20.275L20.625 5Z" fill="white" fill-opacity="0.602"/>
  <path d="M20.6225 5L11.25 20.275L20.6225 16.0875V5Z" fill="white"/>
  <path d="M20.625 27.4571V34.9908L30.0025 22.0171L20.625 27.4571Z" fill="white" fill-opacity="0.602"/>
  <path d="M20.6225 34.9938V27.4588L11.25 22.02L20.6225 34.9938Z" fill="white"/>
  <path d="M20.625 25.7161L29.9962 20.2748L20.625 16.0898V25.7161Z" fill="white" fill-opacity="0.2"/>
  <path d="M11.25 20.2748L20.6225 25.7161V16.0898L11.25 20.2748Z" fill="white" fill-opacity="0.602"/>`,
  USDC: `<path d="M20 40C31.0834 40 40 31.0834 40 20C40 8.9166 31.0834 0 20 0C8.9166 0 0 8.9166 0 20C0 31.0834 8.9166 40 20 40Z" fill="#2775CA"/>
  <path d="M25.5001 23.1665C25.5001 20.2499 23.7501 19.2499 20.2501 18.8333C17.7501 18.4999 17.2501 17.8333 17.2501 16.6665C17.2501 15.4997 18.0835 14.7499 19.7501 14.7499C21.2501 14.7499 22.0835 15.2499 22.5001 16.4999C22.5835 16.7499 22.8335 16.9165 23.0835 16.9165H24.4167C24.7501 16.9165 25.0001 16.6665 25.0001 16.3333V16.2499C24.6667 14.4165 23.1667 12.9999 21.2501 12.8333V10.8333C21.2501 10.4999 21.0001 10.2499 20.5835 10.1665H19.3335C19.0001 10.1665 18.7501 10.4165 18.6667 10.8333V12.7499C16.1667 13.0833 14.5835 14.7499 14.5835 16.8333C14.5835 19.5833 16.2501 20.6665 19.7501 21.0833C22.0835 21.4999 22.8335 21.9999 22.8335 23.3333C22.8335 24.6667 21.6667 25.5833 20.0835 25.5833C17.9167 25.5833 17.1667 24.6665 16.9167 23.4165C16.8335 23.0833 16.5835 22.9165 16.3335 22.9165H14.9167C14.5835 22.9165 14.3335 23.1665 14.3335 23.4999V23.5833C14.6667 25.6665 16.0001 27.1665 18.7501 27.5833V29.5833C18.7501 29.9165 19.0001 30.1665 19.4167 30.2499H20.6667C21.0001 30.2499 21.2501 29.9999 21.3335 29.5833V27.5833C23.8335 27.1665 25.5001 25.4165 25.5001 23.1665Z" fill="white"/>
  <path d="M15.7502 31.9167C9.25016 29.5835 5.91676 22.3335 8.33356 15.9167C9.58356 12.4167 12.3336 9.7501 15.7502 8.5001C16.0836 8.3335 16.2502 8.0835 16.2502 7.6667V6.5001C16.2502 6.1667 16.0836 5.9167 15.7502 5.8335C15.6668 5.8335 15.5002 5.8335 15.4168 5.9167C7.50016 8.4167 3.16676 16.8335 5.66676 24.7501C7.16676 29.4167 10.7502 33.0001 15.4168 34.5001C15.7502 34.6667 16.0836 34.5001 16.1668 34.1667C16.2502 34.0835 16.2502 34.0001 16.2502 33.8335V32.6667C16.2502 32.4167 16.0002 32.0835 15.7502 31.9167ZM24.5836 5.9167C24.2502 5.7501 23.9168 5.9167 23.8336 6.2501C23.7502 6.3335 23.7502 6.4167 23.7502 6.5835V7.7501C23.7502 8.0835 24.0002 8.4167 24.2502 8.5835C30.7502 10.9167 34.0836 18.1667 31.6668 24.5835C30.4168 28.0835 27.6668 30.7501 24.2502 32.0001C23.9168 32.1667 23.7502 32.4167 23.7502 32.8335V34.0001C23.7502 34.3335 23.9168 34.5835 24.2502 34.6667C24.3336 34.6667 24.5002 34.6667 24.5836 34.5835C32.5002 32.0835 36.8336 23.6667 34.3336 15.7501C32.8336 11.0001 29.1668 7.4167 24.5836 5.9167Z" fill="white"/>`,
  RSPT: `<circle cx="20" cy="20.6357" r="20" fill="#050708"/>
  <circle cx="20" cy="20.6357" r="16.75" fill="#050708" stroke="white" stroke-width="0.5"/>
  <rect x="26.5449" y="12.022" width="0.637043" height="21.4877" transform="rotate(38.0121 26.5449 12.022)" fill="white"/>
  <mask id="path-4-inside-1_2811_44616" fill="white">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.7397 23.8608L26.338 29.665L28.9409 23.8374L23.7397 23.8608ZM24.5862 24.2785L26.3385 28.1655L28.0939 24.2628L24.5862 24.2785Z"/>
  </mask>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.7397 23.8608L26.338 29.665L28.9409 23.8374L23.7397 23.8608ZM24.5862 24.2785L26.3385 28.1655L28.0939 24.2628L24.5862 24.2785Z" fill="#C4C4C4"/>
  <path d="M26.338 29.665L25.8816 29.8693L26.3385 30.8899L26.7945 29.8689L26.338 29.665ZM23.7397 23.8608L23.7375 23.3608L22.9697 23.3643L23.2834 24.0651L23.7397 23.8608ZM28.9409 23.8374L29.3974 24.0413L29.7134 23.3339L28.9387 23.3374L28.9409 23.8374ZM26.3385 28.1655L25.8826 28.371L26.339 29.3833L26.7945 28.3706L26.3385 28.1655ZM24.5862 24.2785L24.584 23.7785L23.814 23.7819L24.1304 24.484L24.5862 24.2785ZM28.0939 24.2628L28.5499 24.4679L28.8686 23.7593L28.0916 23.7628L28.0939 24.2628ZM26.7943 29.4607L24.1961 23.6566L23.2834 24.0651L25.8816 29.8693L26.7943 29.4607ZM28.4844 23.6335L25.8814 29.4611L26.7945 29.8689L29.3974 24.0413L28.4844 23.6335ZM23.742 24.3608L28.9432 24.3374L28.9387 23.3374L23.7375 23.3608L23.742 24.3608ZM26.7943 27.96L25.0421 24.073L24.1304 24.484L25.8826 28.371L26.7943 27.96ZM27.6379 24.0577L25.8825 27.9604L26.7945 28.3706L28.5499 24.4679L27.6379 24.0577ZM24.5885 24.7785L28.0961 24.7628L28.0916 23.7628L24.584 23.7785L24.5885 24.7785Z" fill="white" mask="url(#path-4-inside-1_2811_44616)"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.7354 23.8647L28.9395 23.8647L28.9395 23.5486C28.9395 22.1115 27.7745 20.9466 26.3374 20.9466C24.9004 20.9466 23.7354 22.1115 23.7354 23.5486L23.7354 23.8647ZM26.337 21.5497C25.2132 21.5497 24.3005 22.4607 24.3005 23.5845L28.3735 23.5845C28.3735 22.4607 27.4608 21.5497 26.337 21.5497Z" fill="white"/>
  <mask id="path-7-inside-2_2811_44616" fill="white">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.6641 17.4116L14.0658 11.6074L11.4629 17.4351L16.6641 17.4116ZM15.8176 16.994L14.0653 13.1069L12.31 17.0097L15.8176 16.994Z"/>
  </mask>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.6641 17.4116L14.0658 11.6074L11.4629 17.4351L16.6641 17.4116ZM15.8176 16.994L14.0653 13.1069L12.31 17.0097L15.8176 16.994Z" fill="#C4C4C4"/>
  <path d="M14.0658 11.6074L14.5222 11.4031L14.0653 10.3825L13.6093 11.4035L14.0658 11.6074ZM16.6641 17.4116L16.6663 17.9116L17.4341 17.9082L17.1204 17.2073L16.6641 17.4116ZM11.4629 17.4351L11.0064 17.2312L10.6904 17.9386L11.4651 17.9351L11.4629 17.4351ZM14.0653 13.1069L14.5212 12.9015L14.0648 11.8891L13.6093 12.9018L14.0653 13.1069ZM15.8176 16.994L15.8198 17.494L16.5899 17.4905L16.2734 16.7885L15.8176 16.994ZM12.31 17.0097L11.854 16.8046L11.5353 17.5132L12.3122 17.5097L12.31 17.0097ZM13.6095 11.8117L16.2077 17.6159L17.1204 17.2073L14.5222 11.4031L13.6095 11.8117ZM11.9194 17.639L14.5224 11.8113L13.6093 11.4035L11.0064 17.2312L11.9194 17.639ZM16.6618 16.9116L11.4606 16.9351L11.4651 17.9351L16.6663 17.9116L16.6618 16.9116ZM13.6095 13.3124L15.3617 17.1995L16.2734 16.7885L14.5212 12.9015L13.6095 13.3124ZM12.766 17.2148L14.5213 13.312L13.6093 12.9018L11.854 16.8046L12.766 17.2148ZM15.8153 16.494L12.3077 16.5097L12.3122 17.5097L15.8198 17.494L15.8153 16.494Z" fill="white" mask="url(#path-7-inside-2_2811_44616)"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.6684 17.4077L11.4644 17.4077V17.7239C11.4644 19.1609 12.6293 20.3259 14.0664 20.3259C15.5034 20.3259 16.6684 19.1609 16.6684 17.7239V17.4077ZM14.0668 19.7227C15.1906 19.7227 16.1033 18.8117 16.1033 17.6879H12.0303C12.0303 18.8117 12.943 19.7227 14.0668 19.7227Z" fill="white"/>`,
  WETH: `<path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#FEFEFD"/>
  <path d="M20.2154 5.04473V5.05964C20.2303 5.13419 20.2303 5.22366 20.2303 5.31312V16.0636C20.2154 16.1233 20.1706 16.1382 20.1259 16.168C19.8128 16.3171 19.5146 16.4513 19.2014 16.5855C18.769 16.7793 18.3217 16.9881 17.8893 17.1819L16.3237 17.8976C15.8913 18.0915 15.4589 18.2853 15.0414 18.4791C14.5345 18.7177 14.0126 18.9414 13.5056 19.1799C13.0732 19.3738 12.6408 19.5825 12.1935 19.7763C11.8356 19.9404 11.4778 20.0895 11.1348 20.2535C11.105 20.2684 11.0752 20.2833 11.0454 20.2833C11.0305 20.2833 11.0305 20.2833 11.0156 20.2684L11.4181 19.5974C12.1935 18.3151 12.9539 17.0477 13.7293 15.7654C14.5494 14.3936 15.3844 13.0219 16.2044 11.6501C16.9649 10.3827 17.7402 9.11531 18.5007 7.84791C19.0523 6.92346 19.6189 5.99901 20.1706 5.07455C20.1855 5.04473 20.2005 5.02982 20.2005 5H20.2154C20.2005 5.01491 20.2154 5.02982 20.2154 5.04473Z" fill="#8A92B2"/>
  <path d="M29.3698 20.2684L29.3847 20.2833L27.1928 21.5805L20.3042 25.6511C20.2743 25.666 20.2445 25.6809 20.2296 25.6958C20.1849 25.6958 20.1849 25.6511 20.1849 25.6362V25.502V16.2873C20.1849 16.2425 20.1849 16.1829 20.1998 16.1382C20.2147 16.0785 20.2594 16.0934 20.3042 16.1083C20.498 16.1978 20.7067 16.2873 20.9006 16.3767C21.4821 16.6451 22.0636 16.9135 22.6451 17.167C23.1521 17.3907 23.6441 17.6292 24.1511 17.8529C24.658 18.0765 25.165 18.3151 25.672 18.5388C26.1044 18.7326 26.5517 18.9413 26.9841 19.1352C27.4165 19.329 27.8638 19.5378 28.2962 19.7316C28.6392 19.8807 28.9821 20.0447 29.325 20.1938C29.325 20.2386 29.3399 20.2535 29.3698 20.2684Z" fill="#454A75"/>
  <path d="M20.2148 34.9553C20.2148 34.9702 20.1998 34.9851 20.1998 35H20.1849C20.1849 34.9702 20.1551 34.9553 20.1402 34.9254C19.2157 33.6282 18.2913 32.3161 17.3668 31.0189C16.4275 29.6919 15.4732 28.3499 14.5338 27.0229C13.6243 25.7406 12.6998 24.4433 11.7903 23.161C11.5517 22.8181 11.3132 22.4901 11.0746 22.1471C11.0597 22.1173 11.0448 22.1024 11.015 22.0577C11.0597 22.0577 11.0895 22.0875 11.1044 22.1024C12.4016 22.8628 13.6839 23.6233 14.9812 24.3837C16.4722 25.2634 17.9484 26.1431 19.4394 27.0229L20.1998 27.4702C20.2297 27.5 20.2297 27.5298 20.2297 27.5596V34.7465C20.2297 34.8211 20.2297 34.8956 20.2148 34.9553Z" fill="#8A92B2"/>
  <path d="M11 20.2982V20.2833C11.4771 20.0746 11.9394 19.8509 12.4165 19.6421C13.0278 19.3588 13.6392 19.0905 14.2505 18.8072C14.7127 18.5984 15.1899 18.3747 15.6521 18.166C16.338 17.8529 17.0089 17.5547 17.6948 17.2415C18.1571 17.0328 18.6193 16.8241 19.0964 16.6004C19.4245 16.4513 19.7674 16.3022 20.0954 16.1531C20.1252 16.1382 20.17 16.1233 20.1849 16.0934C20.1998 16.0934 20.1998 16.1083 20.1849 16.1233V25.5914C20.1849 25.6362 20.17 25.6809 20.1998 25.7107C20.17 25.7555 20.1402 25.7107 20.1252 25.6958C19.9911 25.6213 19.8569 25.5467 19.7227 25.4573C16.8449 23.7575 13.9523 22.0427 11.0746 20.3429C11.0596 20.328 11.0298 20.3131 11 20.2982Z" fill="#62688F"/>
  <path d="M29.34 22.0577H29.3549C29.3549 22.0875 29.3251 22.1173 29.3102 22.1471C26.5666 26.0089 23.8231 29.8857 21.0796 33.7475C20.7963 34.1501 20.498 34.5527 20.2147 34.9553C20.1998 34.9404 20.1998 34.9254 20.1998 34.9105V34.8211V27.5895V27.4553C20.8261 27.0825 21.4374 26.7247 22.0636 26.3519C24.4792 24.9205 26.8947 23.504 29.2953 22.0726C29.3102 22.0875 29.3251 22.0726 29.34 22.0577Z" fill="#62688F"/>
  <path d="M20.1998 16.1233V16.0934V16.004V5.17892C20.1998 5.13419 20.1849 5.10437 20.2147 5.05964C23.2416 10.0845 26.2684 15.0944 29.2803 20.1193C29.3101 20.164 29.3549 20.2237 29.3698 20.2833C29.161 20.2087 28.9672 20.1044 28.7734 20.0149C28.5348 19.9105 28.2813 19.7912 28.0427 19.6869C27.8936 19.6123 27.7296 19.5527 27.5805 19.4781C27.327 19.3588 27.0736 19.2545 26.8201 19.1352C26.671 19.0755 26.5219 19.001 26.3728 18.9264L25.3887 18.4791C25.2247 18.4046 25.0606 18.33 24.8817 18.2555L24.166 17.9423C24.0169 17.8827 23.8678 17.8081 23.7187 17.7336L22.7346 17.2863C22.5706 17.2117 22.4066 17.1372 22.2276 17.0626L21.5119 16.7495C21.3479 16.6749 21.1988 16.6004 21.0348 16.5258C20.7515 16.3916 20.4682 16.2575 20.17 16.1382C20.2147 16.1233 20.1998 16.1233 20.1998 16.1233Z" fill="#62688F"/>`,
  USDT: `<path d="M20 0C31.0452 0 40 8.9548 40 20C40 31.0452 31.0448 40 20 40C8.9552 40 0 31.0476 0 20C0 8.9524 8.9536 0 20 0Z" fill="#53AE94"/>
  <path d="M22.4684 17.3352V14.36H29.272V9.82681H10.7456V14.36H17.55V17.3328C12.02 17.5868 7.862 18.682 7.862 19.994C7.862 21.306 12.022 22.4012 17.55 22.6568V32.1868H22.47V22.656C27.99 22.4012 32.1396 21.3068 32.1396 19.996C32.1396 18.6852 27.99 17.5908 22.47 17.336L22.4684 17.3352ZM22.47 21.8488V21.8464C22.3312 21.8552 21.618 21.898 20.03 21.898C18.7604 21.898 17.8672 21.862 17.5524 21.8456V21.8496C12.6668 21.6332 9.02 20.7824 9.02 19.7644C9.02 18.7464 12.6672 17.8968 17.5524 17.68V21.002C17.8724 21.024 18.7876 21.078 20.0508 21.078C21.568 21.078 22.3308 21.0148 22.4708 21.002V17.68C27.3468 17.8972 30.9852 18.7488 30.9852 19.7632C30.9852 20.7776 27.3452 21.6296 22.4708 21.8468" fill="white"/>`,
  WBTC: `<path d="M32.6158 8.39477L31.5175 9.49306C34.1382 12.359 35.5915 16.1019 35.5915 19.9855C35.5915 23.869 34.1382 27.6119 31.5175 30.4779L32.6158 31.5762C35.5303 28.4148 37.1484 24.2725 37.1484 19.9727C37.1484 15.6728 35.5303 11.5305 32.6158 8.36914V8.39477Z" fill="#5A5564"/>
  <path d="M9.51858 8.48981C12.3845 5.86909 16.1275 4.41577 20.011 4.41577C23.8945 4.41577 27.6374 5.86909 30.5034 8.48981L31.6017 7.39151C28.4403 4.477 24.298 2.85889 19.9982 2.85889C15.6983 2.85889 11.556 4.477 8.39465 7.39151L9.51858 8.48981Z" fill="#5A5564"/>
  <path d="M8.48981 30.4889C5.8722 27.6236 4.42079 23.8829 4.42079 20.002C4.42079 16.121 5.8722 12.3803 8.48981 9.51505L7.39151 8.41675C4.477 11.5781 2.85889 15.7204 2.85889 20.0203C2.85889 24.3201 4.477 28.4624 7.39151 31.6238L8.48981 30.4889Z" fill="#5A5564"/>
  <path d="M30.4887 31.5027C27.6228 34.1234 23.8799 35.5767 19.9963 35.5767C16.1128 35.5767 12.3699 34.1234 9.50394 31.5027L8.40564 32.601C11.567 35.5155 15.7093 37.1336 20.0092 37.1336C24.309 37.1336 28.4513 35.5155 31.6127 32.601L30.4887 31.5027Z" fill="#5A5564"/>
  <path d="M26.9339 16.3355C26.7142 14.0437 24.7373 13.2749 22.2368 13.0406V9.88486H20.3038V12.9821C19.795 12.9821 19.2751 12.9821 18.7589 12.9821V9.88486H16.8405V13.0626H12.9196V15.1311C12.9196 15.1311 14.3474 15.1054 14.3254 15.1311C14.5829 15.1027 14.8413 15.1755 15.0461 15.3339C15.251 15.4923 15.3864 15.7241 15.4237 15.9804V24.6789C15.4182 24.7693 15.3947 24.8577 15.3544 24.9388C15.3142 25.0199 15.2581 25.0921 15.1894 25.1512C15.1221 25.2114 15.0433 25.2573 14.9577 25.2863C14.8721 25.3152 14.7816 25.3265 14.6915 25.3196C14.7172 25.3416 13.2857 25.3196 13.2857 25.3196L12.9196 27.6297H16.8039V30.8587H18.7369V27.6773H20.2819V30.844H22.2185V27.6516C25.4841 27.454 27.7613 26.6485 28.0468 23.5916C28.2775 21.1314 27.1206 20.0331 25.2718 19.5901C26.3957 19.0373 27.0913 18.0123 26.9339 16.3355ZM24.2248 23.2109C24.2248 25.6125 20.1098 25.3379 18.7992 25.3379V21.0765C20.1098 21.0802 24.2248 20.7031 24.2248 23.2109ZM23.3278 17.2068C23.3278 19.4034 19.8938 19.1362 18.8028 19.1362V15.2629C19.8938 15.2629 23.3278 14.9187 23.3278 17.2068Z" fill="#F09242"/>
  <path d="M19.9963 40C16.041 39.9993 12.1747 38.8258 8.88632 36.6279C5.5979 34.43 3.03502 31.3064 1.52172 27.652C0.00841897 23.9976 -0.387339 19.9766 0.384482 16.0973C1.1563 12.218 3.06104 8.6547 5.85787 5.85787C8.6547 3.06104 12.218 1.1563 16.0973 0.384482C19.9766 -0.387339 23.9976 0.00841897 27.652 1.52172C31.3064 3.03502 34.43 5.5979 36.6279 8.88632C38.8258 12.1747 39.9993 16.041 40 19.9963C40.0005 22.6234 39.4834 25.2248 38.4783 27.652C37.4732 30.0792 35.9997 32.2845 34.1421 34.1421C32.2845 35.9997 30.0792 37.4732 27.652 38.4783C25.2248 39.4834 22.6234 40.0005 19.9963 40ZM19.9963 1.55959C16.3523 1.56249 12.7909 2.64563 9.76225 4.67212C6.73364 6.69861 4.37376 9.57747 2.98091 12.9448C1.58807 16.3122 1.22476 20.0169 1.93693 23.5907C2.64909 27.1645 4.40475 30.4469 6.982 33.0232C9.55925 35.5994 12.8424 37.3538 16.4165 38.0645C19.9906 38.7752 23.6951 38.4105 27.0619 37.0163C30.4287 35.6221 33.3067 33.2611 35.332 30.2317C37.3572 27.2022 38.439 23.6404 38.4404 19.9963C38.4414 17.5743 37.9649 15.1758 37.0383 12.9381C36.1116 10.7003 34.753 8.66715 33.04 6.95485C31.327 5.24255 29.2933 3.8847 27.0552 2.95894C24.817 2.03318 22.4184 1.55767 19.9963 1.55959Z" fill="#282138"/>`,
  wFTM: `<path d="M39.5 20C39.5 30.7696 30.7696 39.5 20 39.5C9.23045 39.5 0.5 30.7696 0.5 20C0.5 9.23045 9.23045 0.5 20 0.5C30.7696 0.5 39.5 9.23045 39.5 20Z" fill="#1969FF" stroke="#1969FF"/>
  <path d="M18.7872 6.36017C19.461 6.00494 20.4863 6.00494 21.1601 6.36017L28.0358 9.98498C28.4416 10.1989 28.6644 10.5177 28.7044 10.8468H28.7109V29.0668C28.702 29.4258 28.477 29.7824 28.0358 30.015L21.1601 33.6398C20.4863 33.9951 19.461 33.9951 18.7872 33.6398L11.9116 30.015C11.4722 29.7834 11.2613 29.4243 11.2508 29.0668C11.2498 29.0301 11.2497 28.9999 11.2508 28.975L11.2508 10.9695C11.2498 10.9441 11.2498 10.9189 11.2508 10.8938L11.2508 10.8468H11.2539C11.2845 10.5141 11.4972 10.2034 11.9116 9.98498L18.7872 6.36017ZM27.6172 20.9766L21.158 24.393C20.4852 24.7489 19.4614 24.7489 18.7886 24.393L12.3438 20.9842V29.0105L18.7886 32.4012C19.1694 32.605 19.5654 32.8035 19.951 32.8122L19.9733 32.8125C20.3581 32.8138 20.7318 32.6181 21.1107 32.4328L27.6172 28.9813V20.9766ZM10.1728 28.6719C10.1728 29.3703 10.2533 29.8294 10.413 30.1528C10.5454 30.4209 10.7441 30.6257 11.1068 30.875L11.1276 30.8892C11.2072 30.9433 11.2949 31.0001 11.4016 31.0667L11.5275 31.1445L11.9141 31.3799L11.3596 32.3047L10.927 32.041L10.8542 31.996C10.7291 31.9181 10.6254 31.8512 10.5287 31.7853C9.49486 31.0821 9.10929 30.3154 9.10168 28.7205L9.10156 28.6719H10.1728ZM19.4531 16.1328C19.4031 16.15 19.3562 16.17 19.3135 16.1926L12.4483 19.8291C12.4411 19.8329 12.4342 19.8366 12.4277 19.8404L12.4219 19.8437L12.4327 19.8499L12.4483 19.8584L19.3135 23.4949C19.3562 23.5175 19.4031 23.5375 19.4531 23.5547V16.1328ZM20.5469 16.1328V23.5547C20.5969 23.5375 20.6438 23.5175 20.6866 23.4949L27.5517 19.8584C27.5589 19.8546 27.5658 19.8509 27.5723 19.8471L27.5781 19.8437L27.5673 19.8376L27.5517 19.8291L20.6866 16.1926C20.6438 16.17 20.5969 16.15 20.5469 16.1328ZM27.6172 12.1484L21.4453 15.3906L27.6172 18.6328V12.1484ZM12.3438 12.1484V18.6328L18.5156 15.3906L12.3438 12.1484ZM20.6806 7.32918C20.3232 7.14027 19.6768 7.14027 19.3194 7.32918L12.4483 10.9619C12.4411 10.9657 12.4342 10.9694 12.4277 10.9732L12.4219 10.9766L12.4327 10.9827L12.4483 10.9913L19.3194 14.6239C19.6768 14.8129 20.3232 14.8129 20.6806 14.6239L27.5516 10.9913C27.5589 10.9874 27.5658 10.9837 27.5723 10.98L27.5781 10.9766L27.5673 10.9704L27.5516 10.9619L20.6806 7.32918ZM28.6404 7.69531L29.0731 7.95896L29.1458 8.004C29.2709 8.08191 29.3746 8.14885 29.4713 8.21464C30.5051 8.91787 30.8907 9.68458 30.8983 11.2795L30.8984 11.3281H29.8272C29.8272 10.6296 29.7467 10.1706 29.587 9.84714C29.4546 9.57909 29.2559 9.37424 28.8932 9.12497L28.8725 9.11081C28.7928 9.05666 28.7052 8.99993 28.5984 8.93326L28.4725 8.85547L28.0859 8.62011L28.6404 7.69531Z" fill="white"/>`,
};

export default tokenIconsLarge;
