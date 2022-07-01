import './Footer.scss';

const Footer = (): JSX.Element => (
  <div className="tw__footer">
    <div className="tw__footer__background" />
    <div className="tw__footer__logo">
      <img src="/images/header-logo.svg" alt="Tempus DAO" />
    </div>
    <div className="tw__footer__links-container">
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Token</p>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://forum.tempus.finance/"
            target="_blank"
            rel="noreferrer"
          >
            Governance
          </a>
        </div>
        {/* TODO - Add token page */}
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation" href="#" target="_blank" rel="noreferrer">
            Tokenomics
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://www.coingecko.com/en/coins/tempus"
            target="_blank"
            rel="noreferrer"
          >
            Coingecko
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://coinmarketcap.com/currencies/tempus/"
            target="_blank"
            rel="noreferrer"
          >
            Coinmarketcap
          </a>
        </div>
      </div>
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Team</p>
        {/* TODO - Add Team page */}
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation" href="#" target="_blank" rel="noreferrer">
            Tempus Labs
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation" href="#investors-section">
            Investors
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://angel.co/company/tempusfinance/jobs"
            target="_blank"
            rel="noreferrer"
          >
            We&apos;re Hiring!
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation" href="mailto:contact@tempus.finance">
            Contact
          </a>
        </div>
      </div>
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Community</p>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://discord.com/invite/6gauHECShr"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://twitter.com/tempusfinance"
            target="_blank"
            rel="noreferrer"
          >
            Twitter
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://t.me/tempuschat"
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
        </div>
        <div className="tw__footer__link-container">
          <a
            className="tw__footer__link tw__hover-animation"
            href="https://medium.com/tempusfinance"
            target="_blank"
            rel="noreferrer"
          >
            Medium
          </a>
        </div>
      </div>
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Legal</p>
        {/* TODO - Add Terms page */}
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation">Terms</a>
        </div>
        {/* TODO - Add disclaimer page */}
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation">Disclaimer</a>
        </div>
        {/* TODO - Add Privacy page */}
        <div className="tw__footer__link-container">
          <a className="tw__footer__link tw__hover-animation">Privacy</a>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
