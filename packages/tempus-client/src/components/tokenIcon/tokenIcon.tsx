import { FC } from 'react';
import { tokenIcons, Token } from './tokenIcons';

type IconInProps = {
  token: Token;
};

const Icon: FC<IconInProps> = ({ token }): JSX.Element => {
  return (
    <svg
      aria-hidden="true"
      className="tf-icon"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      role="img"
      dangerouslySetInnerHTML={{ __html: tokenIcons[token] }}
    />
  );
};

export default Icon;
