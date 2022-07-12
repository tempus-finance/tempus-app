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
      <Header color="#070b37" menuIconColor="light" />
      <div className="tw__legalPage">
        <div className="tw__legalPage__header">
          <div className="tw__legalPage__header-content">
            <h1 className="tw__legalPage__header-title">Tempus Disclaimer</h1>
          </div>
        </div>
        <div className="tw__legalPage__body">
          <div className="tw__legalPage__body-content">
            <p className="tw__legalPage__body-content-text">
              This website is operated by Tempus Labs Inc., a limited company based in the British Virgin Islands (the
              “Issuer”) in association with Tempus Foundation Company, a foundation company based in the Cayman Islands
              (the “Foundation”) (the Issuer and the Foundation together, “Tempus”, “we”, “our”, or “us”). This website
              acts as a front-end to various crypto applications deployed on the relevant blockchain (which includes any
              blockchain that Tempus contracts are deployed on, including but not limited to Ethereum, Fantom, and L2’s
              such as StarkNet), that allows users to interact with certain cryptoassets using smart contracts. Such
              applications are made up of free, public, open-source or source-available software. Your use of such
              applications involves various risks, including, but not limited to, losses while cryptoassets are supplied
              to the applications, losses due to the fluctuation of prices of tokens in a pool, and losses due to price
              slippage and cost. Before using the applications, you should review the relevant documentation from our
              GitHub to ensure you understand how the applications work. Additionally, just as you can access email
              protocols such as SMTP through multiple email clients, you can access the applications through various web
              and mobile interfaces. You are responsible for doing your own due diligence on these interfaces to
              understand the fees and risks they present.
              <br />
              <br />
              AS DESCRIBED IN THE TEMPUS <Link to="/terms#top">TERMS OF SERVICE</Link>, THE APPLICATIONS ARE PROVIDED
              “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND. Although the Issuer developed much of the
              code for the applications, the Issuer does not provide, own, or control the applications, which are run by
              smart contracts deployed on the relevant blockchain. Upgrades and modifications to the applications are
              managed in a community-driven way by governance by holders of the TEMP governance token. No Tempus
              developer or entity involved in creating the applications will be liable for any claims or damages
              whatsoever associated with your use, inability to use, or your interaction with other users of, the
              applications, including any direct, indirect, incidental, special, exemplary, punitive or consequential
              damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
              <br />
              <br />
              By accessing or using the applications, you signify that you have read, understand, and agree with this
              Disclaimer. If you do not agree with this Disclaimer, you are not authorised to access or use the
              applications and should not use the applications.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default memo(Disclaimer);
