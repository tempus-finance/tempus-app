import './Header.scss';

const Header = (): JSX.Element => (
  <div className="tw__header">
    <div>
      <img src="/images/header-logo.svg" alt="Tempus DAO" />
    </div>
    <div className="tw__header-links">
      {/* TODO - Add click handlers */}
      <p className="tw__header-link">Products</p>
      <p className="tw__header-link">Contributors</p>
      <p className="tw__header-link">Token</p>
      <p className="tw__header-link">Docs</p>
      <p className="tw__header-link">Blog</p>
    </div>
    <div className="tw__header-separator" />
  </div>
);
export default Header;
