import { useCallback, useState } from 'react';
import { Link } from '../shared';
import { MenuIcon } from './icons';
import './Header.scss';

const Header = (): JSX.Element => {
  const [menuOpened, setMenuOpened] = useState(false);

  const handleMenuOpen = useCallback(() => setMenuOpened(true), []);

  const handleMenuClose = useCallback(() => setMenuOpened(false), []);

  const handleLinkClick = useCallback(() => {
    setTimeout(() => {
      handleMenuClose();
    }, 200);
  }, [handleMenuClose]);

  return (
    <div className="tw__header">
      <div className="tw__header-logo">
        <Link href="/">
          <img src="/images/header-logo.svg" alt="Tempus DAO" />
        </Link>
      </div>
      {/* TODO: Add hover style for menu button */}
      <button type="button" className="tw__btn tw__header-menu-button" onClick={handleMenuOpen}>
        <MenuIcon />
      </button>
      <div className={`tw__header-links ${menuOpened ? 'tw__header-menu-opened' : ''}`}>
        {/* TODO: Replace with close icon when the design is ready */}
        {/* TODO: Add hover style for close button */}
        {menuOpened && (
          <button type="button" className="tw__btn tw__header-close-button" onClick={handleMenuClose}>
            Close
          </button>
        )}
        {/* TODO - Add click handlers */}
        <Link className="tw__header-link tw__hover-animation" href="/team" onClick={handleLinkClick}>
          Team
        </Link>
        <Link className="tw__header-link tw__hover-animation" href="/tokenomics" onClick={handleLinkClick}>
          Tokenomics
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
      <div className="tw__header-separator" />
    </div>
  );
};

export default Header;
