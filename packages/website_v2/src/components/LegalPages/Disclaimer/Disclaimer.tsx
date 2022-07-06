import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Footer';
import Header from '../../Header';

const Disclaimer = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header color="#070b37" />
      <div className="tw__legalPage">
        <div className="tw__legalPage__header">
          <div className="tw__legalPage__header-content">
            <h1 className="tw__legalPage__header-title">Tempus Protocol Disclaimer</h1>
          </div>
        </div>
        <div className="tw__legalPage__body">
          <div className="tw__legalPage__body-content">
            <p className="tw__legalPage__body-content-text">
              Tempus Protocol (the “Protocol”) is a decentralized finance application deployed on the relevant
              blockchain (which includes any blockchain that Tempus contracts are deployed on, including but not limited
              to Ethereum and Fantom) that allows suppliers and borrowers of certain cryptoassets to earn yields using
              smart contracts. The Protocol is made up of free, public, open-source or source-available software. Your
              use of the Protocol involves various risks, including, but not limited to, losses while cryptoassets are
              supplied to the Protocol, losses due to the fluctuation of prices of tokens in a pool, and losses due to
              price slippage and cost. Before using the Protocol, you should review the relevant documentation from our
              GitHub to ensure you understand how the Protocol works. Additionally, just as you can access email
              protocols such as SMTP through multiple email clients, you can access the Protocol through various web and
              mobile interfaces. You are responsible for doing your own due diligence on these interfaces to understand
              the fees and risks they present.
              <br />
              <br />
              AS DESCRIBED IN THE TEMPUS <Link to="/terms#top">TERMS OF SERVICE</Link>, THE PROTOCOL IS PROVIDED “AS
              IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND. Although Tempus Labs, Inc. (trading as
              “Tempus”) developed much of the code for the Protocol, Tempus does not provide, own, or control the
              Protocol, which is run by smart contracts deployed on the relevant blockchain. Upgrades and modifications
              to the Protocol are managed in a community-driven way by governance by holders of the TEMP governance
              token. No Tempus developer or entity involved in creating the Protocol will be liable for any claims or
              damages whatsoever associated with your use, inability to use, or your interaction with other users of,
              the Protocol, including any direct, indirect, incidental, special, exemplary, punitive or consequential
              damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
              <br />
              <br />
              By accessing or using the Protocol, you signify that you have read, understand, and agree with this
              Disclaimer. If you do not agree with this Disclaimer, you are not authorised to access or use the Protocol
              and should not use the Protocol.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default memo(Disclaimer);
