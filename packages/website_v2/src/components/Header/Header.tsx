import { Link } from '../shared';
import './Header.scss';

const Header = (): JSX.Element => (
  <div className="tw__header">
    <div>
      <img src="/images/header-logo.svg" alt="Tempus DAO" />
    </div>
    <div className="tw__header-links">
      {/* TODO - Add click handlers */}
      <p className="tw__header-link tw__hover-animation">Products</p>
      <Link className="tw__header-link tw__hover-animation" href="/team">
        Contributors
      </Link>
      <p className="tw__header-link tw__hover-animation">Token</p>
      <p className="tw__header-link tw__hover-animation">Docs</p>
      <p className="tw__header-link tw__hover-animation">Blog</p>
    </div>
    <div className="tw__header-separator" />
  </div>
);
export default Header;
