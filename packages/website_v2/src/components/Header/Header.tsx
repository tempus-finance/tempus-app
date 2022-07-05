import { Link } from '../shared';
import './Header.scss';

const Header = (): JSX.Element => (
  <div className="tw__header">
    <div>
      <Link href="/">
        <img src="/images/header-logo.svg" alt="Tempus DAO" />
      </Link>
    </div>
    <div className="tw__header-links">
      {/* TODO - Add click handlers */}
      <p className="tw__header-link tw__hover-animation">Products</p>
      <Link className="tw__header-link tw__hover-animation" href="/team">
        Contributors
      </Link>
      <p className="tw__header-link tw__hover-animation">Token</p>
      <p className="tw__header-link tw__hover-animation">Docs</p>
      <Link className="tw__header-link tw__hover-animation" href="https://medium.com/tempusfinance">
        Blog
      </Link>
    </div>
    <div className="tw__header-separator" />
  </div>
);
export default Header;
