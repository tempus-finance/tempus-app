import { FC, forwardRef, memo, HTMLProps, useMemo } from 'react';
import { Link as InternalLink } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import './Link.scss';

interface LinkProps {
  className?: string;
  title?: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { children, className = '', disabled, title, href = '', onClick } = props;

  const isExternal = useMemo(() => href.includes('://') && new URL(href).origin !== window.location.origin, [href]);

  const isHash = useMemo(() => !isExternal && href.includes('#'), [href, isExternal]);

  return (
    <>
      {isExternal && (
        <a
          ref={ref}
          rel="external noreferrer nofollow"
          target="_blank"
          className={`tw__link ${className} ${disabled ? 'disabled' : ''}`}
          title={title}
          href={href}
          onClick={onClick}
        >
          {children}
        </a>
      )}
      {isHash && (
        <HashLink
          ref={ref}
          className={`tw__link ${className} ${disabled ? 'disabled' : ''}`}
          title={title}
          to={disabled ? '#' : href}
          onClick={onClick}
        >
          {children}
        </HashLink>
      )}
      {!isExternal && !isHash && (
        <InternalLink
          ref={ref}
          className={`tw__link ${className} `}
          title={title}
          to={disabled ? '#' : href}
          onClick={onClick}
        >
          {children}
        </InternalLink>
      )}
    </>
  );
});

export default memo(Link as FC<LinkProps & HTMLProps<HTMLAnchorElement>>);
