import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '../shared';
import MenuButton from './MenuButton';

import './Header.scss';

interface HeaderProps {
  color: string;
  menuIconColor: 'dark' | 'light';
}

const Header: FC<HeaderProps> = (props): JSX.Element => {
  const { color, menuIconColor } = props;

  const [menuOpened, setMenuOpened] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const onMenuToggle = useCallback((opened: boolean) => {
    setMenuOpened(opened);
  }, []);

  useEffect(() => {
    if (menuContainerRef.current) {
      menuContainerRef.current.style.left = menuOpened ? '0%' : '-100%';
    }
  }, [menuOpened]);

  const handleLinkClick = useCallback(() => {
    setTimeout(() => {
      setMenuOpened(false);
    }, 200);
  }, []);

  return (
    <div className="tw__header" style={{ backgroundColor: color }}>
      <div className="tw__container tw__header__container">
        <div className="tw__header-logo">
          <Link href="/" className="tw__clickable-logo">
            <img className="tw__header-logo-img-light" src="/images/header-logo.svg" alt="Tempus" />
            <img className="tw__header-logo-img-dark" src="/images/header-logo-dark.svg" alt="Tempus" />
          </Link>
        </div>

        <div className="tw__header-links">
          <Link className="tw__header-link tw__hover-animation" href="/team" onClick={handleLinkClick}>
            Team
          </Link>
          <Link className="tw__header-link tw__hover-animation" href="/token" onClick={handleLinkClick}>
            Token
          </Link>
          <Link className="tw__header-link tw__hover-animation" href="/governance" onClick={handleLinkClick}>
            Governance
          </Link>
          <Link
            className="tw__header-link tw__hover-animation"
            href="https://docs.tempus.finance/"
            onClick={handleLinkClick}
          >
            Docs
          </Link>
          <Link
            className="tw__header-link tw__hover-animation"
            href="https://medium.com/tempusfinance/"
            onClick={handleLinkClick}
          >
            Blog
          </Link>
        </div>

        <div className="tw__header-menu">
          <div className="tw__header-menu-container" ref={menuContainerRef}>
            <div className="tw__header-menu-bar">
              <div className="tw__header-menu-logo">
                <Link href="/" className="tw__clickable-logo">
                  <img className="tw__header-logo-img-light" src="/images/header-logo.svg" alt="Tempus" />
                  <img className="tw__header-logo-img-dark" src="/images/header-logo-dark.svg" alt="Tempus" />
                </Link>
              </div>
              <div className="tw__header__menu-bar-separator" />
            </div>
            <div className="tw__header__menu-body">
              <Link className="tw__header-menu-link tw__hover-animation" href="/team" onClick={handleLinkClick}>
                Team
              </Link>
              <Link className="tw__header-menu-link tw__hover-animation" href="/token" onClick={handleLinkClick}>
                Token
              </Link>
              <Link className="tw__header-menu-link tw__hover-animation" href="/governance" onClick={handleLinkClick}>
                Governance
              </Link>
              <Link
                className="tw__header-menu-link tw__hover-animation"
                href="https://docs.tempus.finance/"
                onClick={handleLinkClick}
              >
                Docs
              </Link>
              <Link
                className="tw__header-menu-link tw__hover-animation"
                href="https://medium.com/tempusfinance/"
                onClick={handleLinkClick}
              >
                Blog
              </Link>
            </div>
          </div>
          <MenuButton onChange={onMenuToggle} checked={menuOpened} color={menuIconColor} />
        </div>
        <div className="tw__header-separator" />
      </div>
    </div>
  );
};

export default memo(Header);
