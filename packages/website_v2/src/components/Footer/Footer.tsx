import { memo } from 'react';
import { Link } from '../shared';

import './Footer.scss';

const Footer = (): JSX.Element => (
  <div className="tw__footer">
    <div className="tw__container tw__footer__container">
      <div className="tw__footer__background" />
      <div className="tw__footer__logo">
        <img src="/images/header-logo.svg" alt="Tempus" />
      </div>
      <div className="tw__footer__links-container">
        <div className="tw__footer__links-column">
          <p className="tw__footer__links-title">Token</p>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/governance">
              Governance
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/token">
              TEMP
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="https://www.coingecko.com/en/coins/tempus">
              CoinGecko
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="https://coinmarketcap.com/currencies/tempus/">
              CoinMarketCap
            </Link>
          </div>
        </div>
        <div className="tw__footer__links-column">
          <p className="tw__footer__links-title">Team</p>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/team">
              Tempus Labs
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/#investors-section">
              Investors
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="https://angel.co/company/tempusfinance/jobs">
              Jobs
            </Link>
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
            <Link className="tw__footer__link tw__hover-animation" href="https://discord.com/invite/6gauHECShr">
              Discord
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="https://twitter.com/tempusfinance">
              Twitter
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="https://t.me/tempuschat">
              Telegram
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="https://medium.com/tempusfinance">
              Medium
            </Link>
          </div>
        </div>
        <div className="tw__footer__links-column">
          <p className="tw__footer__links-title">Legal</p>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/terms#top">
              Terms
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/disclaimer#top">
              Disclaimer
            </Link>
          </div>
          <div className="tw__footer__link-container">
            <Link className="tw__footer__link tw__hover-animation" href="/privacy#top">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default memo(Footer);
