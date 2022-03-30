import React, { ForwardedRef, forwardRef, memo, ReactNode, useMemo } from 'react';
import { Link as InternalLink } from 'react-router-dom';

import './link.scss';

export interface LinkProps {
  children: ReactNode;
  className?: string;
  title?: string;
  href?: string;
  onClick?: () => void;
}

const Link = forwardRef((props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) => {
  const { children, className = '', title, href = '', onClick } = props;

  const isExternal = useMemo(() => href.includes('://') && new URL(href).origin !== window.location.origin, [href]);

  return isExternal ? (
    <a
      ref={ref}
      rel="external noreferrer nofollow"
      target="_blank"
      className={`tc__link ${className}`}
      title={title}
      href={href}
      onClick={onClick}
    >
      {children}
    </a>
  ) : (
    <InternalLink ref={ref} className={`tc__link ${className}`} title={title} to={href} onClick={onClick}>
      {children}
    </InternalLink>
  );
});

export default memo(Link);
