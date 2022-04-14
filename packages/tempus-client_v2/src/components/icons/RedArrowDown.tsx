import { memo } from "react";

const RedArrowDown = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" transform="rotate(-180 10 10)" fill="#FFD9D9" />
      <path
        d="M9.57574 16.4243C9.81005 16.6586 10.1899 16.6586 10.4243 16.4243L14.2426 12.6059C14.477 12.3716 14.477 11.9917 14.2426 11.7574C14.0083 11.523 13.6284 11.523 13.3941 11.7574L10 15.1515L6.60589 11.7574C6.37157 11.523 5.99167 11.523 5.75736 11.7574C5.52304 11.9917 5.52304 12.3716 5.75736 12.6059L9.57574 16.4243ZM9.4 4L9.4 16L10.6 16L10.6 4L9.4 4Z"
        fill="#FF0F0F"
      />
    </svg>
  );
};
export default memo(RedArrowDown);
