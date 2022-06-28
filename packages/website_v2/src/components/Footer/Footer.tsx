import './Footer.scss';

// TODO
// contact email?
const Footer = (): JSX.Element => (
  <div className="tw__footer">
    <div className="tw__footer__logo">
      <img src="/images/header-logo.svg" alt="Tempus DAO" />
    </div>

    <div className="tw__footer__links">
      <ul>
        <li>
          <a href="https://tempus.finance/terms-of-service" target="_self">
            terms
          </a>
        </li>
        <li>
          <a href="https://tempus.finance/disclaimer" target="_self">
            disclaimer
          </a>
        </li>
        <li>
          <a href="https://tempus.finance/privacy-policy" target="_self">
            privacy
          </a>
        </li>
        <li>
          <a href="" target="_self">
            contact
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default Footer;
