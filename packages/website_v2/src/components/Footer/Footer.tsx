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
        <a className="tw__footer__link" href="https://forum.tempus.finance/" target="_blank" rel="noreferrer">
          Governance
        </a>
        {/* TODO - Add token page */}
        <a className="tw__footer__link" href="#" target="_blank" rel="noreferrer">
          Tokenomics
        </a>
        <a
          className="tw__footer__link"
          href="https://www.coingecko.com/en/coins/tempus"
          target="_blank"
          rel="noreferrer"
        >
          Coingecko
        </a>
        <a
          className="tw__footer__link"
          href="https://coinmarketcap.com/currencies/tempus/"
          target="_blank"
          rel="noreferrer"
        >
          Coinmarketcap
        </a>
      </div>
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Team</p>
        {/* TODO - Add Team page */}
        <a className="tw__footer__link" href="#" target="_blank" rel="noreferrer">
          Tempus Labs
        </a>
        <a className="tw__footer__link" href="#investors-section">
          Investors
        </a>
        <a
          className="tw__footer__link"
          href="https://angel.co/company/tempusfinance/jobs"
          target="_blank"
          rel="noreferrer"
        >
          We&apos;re Hiring!
        </a>
        <a className="tw__footer__link" href="mailto:contact@tempus.finance">
          Contact
        </a>
      </div>
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Community</p>
        <a className="tw__footer__link" href="https://discord.com/invite/6gauHECShr" target="_blank" rel="noreferrer">
          Discord
        </a>
        <a className="tw__footer__link" href="https://twitter.com/tempusfinance" target="_blank" rel="noreferrer">
          Twitter
        </a>
        <a className="tw__footer__link" href="https://t.me/tempuschat" target="_blank" rel="noreferrer">
          Telegram
        </a>
        <a className="tw__footer__link" href="https://medium.com/tempusfinance" target="_blank" rel="noreferrer">
          Medium
        </a>
      </div>
      <div className="tw__footer__links-column">
        <p className="tw__footer__links-title">Legal</p>
        {/* TODO - Add Terms page */}
        <a className="tw__footer__link">Terms</a>
        {/* TODO - Add disclaimer page */}
        <a className="tw__footer__link">Disclaimer</a>
        {/* TODO - Add Privacy page */}
        <a className="tw__footer__link">Privacy</a>
      </div>
    </div>
  </div>
);

export default Footer;
