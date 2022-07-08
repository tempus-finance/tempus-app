import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Footer';
import Header from '../../Header';

const Terms = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header color="#070b37" menuIconColor="light" />
      <div className="tw__legalPage">
        <div className="tw__legalPage__header">
          <div className="tw__legalPage__header-content">
            <h1 className="tw__legalPage__header-title">Tempus Terms of Service</h1>
            <h2 className="tw__legalPage__header-subtitle">Last updated: 21 February 2022</h2>
          </div>
        </div>
        <div className="tw__legalPage__body">
          <div className="tw__legalPage__body-content">
            <h3 className="tw__legalPage__body-content-title">1. Introduction</h3>
            <p className="tw__legalPage__body-content-text">
              These Terms of Service (the “Terms”) are issued by Tempus Labs Inc., a limited company based in the
              British Virgin Islands (the “Issuer”) in association with Tempus Foundation Company, a foundation company
              based in the Cayman Islands (the “Foundation”) (the Issuer and the Foundation together, “Tempus”, “we”,
              “our”, or “us”). We own and operate the website <Link to="/">https://tempus.finance</Link> which acts as a
              front-end to the decentralized finance application (known as “Tempus Protocol”) available at
              <a href="https://app.tempus.finance"> https://app.tempus.finance</a> (the website and application together
              the “Site”). These Terms apply to you (“You”) as a user of the Site, including all the products, services,
              tools and information made available on the Site.
              <br />
              <br />
              Please read these Terms carefully as they explain the terms and conditions on which you may use and access
              the Site. These Terms contain important information, including a binding mandatory individual arbitration
              and class action/jury trial waiver provision, both of which impact your rights as to how disputes are
              resolved. By accessing or using the Site, you signify that you have read, understand, and agree to be
              bound by the Terms in their entirety. If you do not agree to the Terms, you are not authorised to access
              or use the Site and should not use the Site.
              <br />
              <br />
              Our <Link to="/privacy#top">Privacy Policy</Link> and <Link to="/disclaimer#top">Disclaimer</Link> are
              incorporated into these Terms by reference and also apply to your use of the Site.
            </p>

            <h3 className="tw__legalPage__body-content-title">2. Modification of the Terms</h3>

            <p className="tw__legalPage__body-content-text">
              We reserve the right, in our sole discretion, to modify these Terms from time to time. You are advised to
              check these Terms periodically to familiarize yourself with any changes. If we make any changes, we will
              notify you by updating the date at the top of these Terms and by maintaining a current version of the
              Terms at
              <Link to="/terms#top"> https://tempus.finance/terms</Link>. All changes will be immediately effective when
              they are posted, and your continued accessing or use of the Site will serve as confirmation of your
              acceptance of the changes. If you do not agree with any changes to these Terms, you must immediately stop
              accessing and using the Site.
            </p>

            <h3 className="tw__legalPage__body-content-title">3. Site</h3>

            <p className="tw__legalPage__body-content-text">
              As part of the Site, Tempus provides access to the decentralized finance application Tempus Protocol on
              the relevant blockchain (which includes any blockchain that Tempus contracts are deployed on, including
              but not limited to Ethereum and Fantom), that allows suppliers and borrowers of certain cryptoassets to
              earn yields using smart contracts (“Smart Contracts”).
              <br />
              <br />
              Using the Tempus Protocol may require that you pay a fee, such as gas costs for using the networks
              supported by Tempus, to perform a transaction. You acknowledge and agree that Tempus has no control over
              any transactions made over Tempus Protocol, the method of payment of any transactions or any actual
              payments of transactions. Accordingly, you must ensure that you have a sufficient balance of the
              applicable cryptocurrency tokens stored at your Tempus Protocol-compatible wallet address (“Cryptocurrency
              Wallet”) to complete any transaction on the Tempus Protocol or the relevant network before initiating such
              transaction.
            </p>

            <h3 className="tw__legalPage__body-content-title">4. Access to the Site and All Rights Reserved</h3>

            <p className="tw__legalPage__body-content-text">
              Access to the Site is provided “as is” and on an “as available” basis only. To the fullest extent
              permitted by law, we disclaim any representations and warranties of any kind, whether express, implied, or
              statutory, including (but not limited to) the warranties of merchantability and fitness for a particular
              purpose. You acknowledge and agree that your use of the Site is at your own risk.
              <br />
              <br />
              We do not guarantee that the Site, or any content on it, will always be available, uninterrupted, timely,
              or secure, or free from errors, omissions, defects, viruses, or other harmful elements. You are
              responsible for configuring your information technology, computer programmes and platform in order to
              access the Site. You should use your own virus protection software.
              <br />
              <br />
              We cannot promise that the use of the Site, or any content taken from the Site, will not infringe the
              rights of any third party.
              <br />
              <br />
              From time to time, access to the Site may be interrupted, suspended or restricted (temporarily or
              permanently), in whole or in part, for any reason whatsoever, including because of a fault, error or
              unforeseen circumstances (including circumstances or events beyond our control, including without
              limitation any flood, extraordinary weather conditions, earthquake, or other act of God, fire, war,
              insurrection, riot, labor dispute, accident, action of government, communications, power failure, or
              equipment or software malfunction) or because we are carrying out planned maintenance.
              <br />
              <br />
              We reserve the right to limit the availability of the Site to any person, geographic area or jurisdiction
              we so desire and/or to terminate your access to and use of the Site, at any time and in our sole
              discretion.
              <br />
              <br />
              We may suspend or disable your access to the Site if we consider it reasonable to do so, e.g. if you
              breach these Terms.
              <br />
              <br />
              We also reserve the right to modify, substitute, eliminate or add to the content of the Site at any time.
              Additionally, some of the content may be out of date at any given time and we are under no obligation to
              update it.
              <br />
              <br />
              We will not be liable to you for any loss or damage you may suffer as a result of the Site being
              unavailable at any time for any reason.
              <br />
              <br />
              We may cooperate with any law enforcement, court or government investigation or order or third party
              requesting or directing that we disclose information or content or information that you provide on the
              Site.
            </p>

            <h3 className="tw__legalPage__body-content-title">5. Risks of using the Site</h3>

            <div className="tw__legalPage__body-content-text">
              <p>
                You acknowledge that the Site and your use of the Site contain certain risks, including without
                limitation the following risks:
              </p>
              <ul>
                <li>
                  That any Smart Contracts you interact with are entirely your own responsibility and liability, and
                  that Tempus is not party to the Smart Contracts.
                </li>
                <li>
                  At any time, your access to your cryptoassets may be suspended or terminated or there may be a delay
                  in your access or use of your cryptoassets which may result in the cryptoassets diminishing in value
                  or you being unable to complete a Smart Contract.
                </li>
                <li>
                  Any site and/or application may be suspended or terminated for any or no reason, which may limit your
                  access to your cryptoassets.
                </li>
                <li>
                  That the Site could be impacted by one or more regulatory inquiries or actions, which would impede or
                  limit the ability of Tempus to continue to make available the Tempus Protocol and, thus, could impede
                  or limit your ability to access or use the Site.
                </li>
                <li>
                  You understand that the relevant blockchain remains under development, which creates technological and
                  security risks when using the Site in addition to uncertainty relating to cryptoassets and
                  transactions therein. You acknowledge that the cost of transacting on the relevant blockchain is
                  variable and may increase at any time causing impact to any activities taking place on the relevant
                  blockchain, which may result in price fluctuations or increased costs when using the Site.
                </li>
                <li>
                  You acknowledge that the Site may be subject to flaws and that you are solely responsible for
                  evaluating any code provided by the Site. This warning and others Tempus provides in these Terms in no
                  way evidence or represent an on-going duty to alert you to all of the potential risks of utilizing or
                  accessing the Site.
                </li>
                <li>
                  You acknowledge and understand that cryptography is a progressing field with advances in code cracking
                  or other technical advancements, such as the development of quantum computers, which may present risks
                  to the Site, and could result in the theft or loss of your cryptoassets. To the extent possible, we
                  intend to update Tempus-developed smart contracts related to the Site to account for any advances in
                  cryptography and to incorporate additional security measures necessary to address risks presented from
                  technological advancements, but that intention does not guarantee or otherwise ensure full security of
                  the Site.
                </li>
              </ul>
              Accordingly, you expressly agree that:
              <ul>
                <li>
                  You assume all risk in connection with your access and use of the Site, the Tempus Protocol and the
                  Smart Contracts.
                </li>
                <li>
                  You alone are responsible for securing the private key(s) associated with your Smart Contracts. You
                  acknowledge that we do not have access to your private key(s) and that losing control of your private
                  key(s) will permanently and irreversibly deny you access to cryptoassets on the relevant blockchain.
                  Neither Tempus nor any other person or entity will be able to retrieve or protect your cryptoassets.
                  If your private key(s) are lost, then you will not be able to transfer your cryptoassets to any other
                  blockchain address or wallet. If this occurs, then you will not be able to realize any value or
                  utility from the cryptoassets that you may hold.
                </li>
                <li>
                  You expressly waive and release Tempus from any and all liability, claims, causes of action, or
                  damages arising from or in any way related to your use of the Site, the Tempus Protocol or the Smart
                  Contracts.
                </li>
              </ul>
            </div>

            <h3 className="tw__legalPage__body-content-title">6. Eligibility of Use</h3>

            <p className="tw__legalPage__body-content-text">
              To access or use the Site, you must be able to form a legally binding contract online either as an
              individual or on behalf of a legal entity. You therefore represent that (a) if you are agreeing to these
              Terms on behalf of a legal entity, you have the legal authority to bind the legal entity to these Terms,
              (b) you are at least 18 years old or the age of majority where you reside, whichever is older, (c) can
              form a legally binding contract online, and (d) have the full right, power, and authority to enter into
              and comply with the obligations under these Terms (on behalf of yourself and any legal entity for which
              you may access or use the Site).
              <br />
              <br />
              You further represent that you are not (a) the subject of economic or trade sanctions administered or
              enforced by any governmental authority or otherwise designated on any list of prohibited or restricted
              parties, or (b) a citizen, resident, or organized in a jurisdiction or territory that is the subject of
              comprehensive country-wide, territory-wide, or regional economic sanctions.
              <br />
              <br />
              Finally, you represent that your access and use of the Site will fully comply with all applicable laws and
              regulations, and that you will not access or use the Site to conduct, promote, or otherwise facilitate any
              illegal activity.
            </p>

            <h3 className="tw__legalPage__body-content-title">7. Intellectual Property Rights</h3>

            <p className="tw__legalPage__body-content-text">
              Unless otherwise stated, we own all intellectual property and other rights in the Site and its contents,
              including (but not limited to) software, text, images, trademarks, service marks, copyrights, patents, and
              designs. These works are protected by intellectual property laws and all such rights are reserved.
              <br />
              <br />
              The Tempus Protocol (available at <a href="https://app.tempus.finance">https://app.tempus.finance</a>) is
              comprised entirely of open-source or source-available software running on the public relevant blockchain.
              <br />
              <br />
              <Link to="/">https://tempus.finance</Link> is the uniform resource locator (“URL”) of Tempus. You will not
              make use of this URL (or any other URL owned by us) on another website or digital platform without our
              prior written consent.
              <br />
              <br />
              You agree not to monitor, use or copy our web pages without our prior consent. Any unauthorised use or
              reproduction may be prosecuted.
              <br />
              <br />
              You will retain ownership of all copyright in data you upload or submit to the Site (“Your Content”).
              However, you grant us a worldwide, royalty-free, fully paid-up, sub-licensable, transferable, perpetual,
              irrevocable licence to use, copy, distribute or publish and send this data in any form, medium, or manner.
              You represent and warrant that (a) you own Your Content or have the right to grant the rights and licenses
              described in these Terms, and (b) Your Content and our use of Your Content, as licensed herein, does not
              and will not violate, misappropriate, or infringe on any third party’s rights.
            </p>

            <h3 className="tw__legalPage__body-content-title">8. Privacy</h3>

            <p className="tw__legalPage__body-content-text">
              When you use the Site, the only information we collect from you is your blockchain wallet address,
              completed transaction hashes, and the token names, symbols, or other blockchain identifiers of the tokens
              that you interact with. We do not collect any personal information from you (e.g., your name or other
              identifiers that can be linked to you). We do, however, use third-party service providers, which may
              receive or independently obtain your personal information from publicly-available sources. We do not
              control how these third parties handle your data and you should review their privacy policies to
              understand how they collect, use, and share your personal information. By accessing and using the Site,
              you understand and consent to our data practices and our service providers&apos; treatment of your
              information.
              <br />
              <br />
              Please also note that when you use the Site, you are interacting with the relevant blockchain, which
              provides transparency into your transactions. Tempus does not control and is not responsible for any
              information you make public on the relevant blockchain by taking actions through the Site.
            </p>

            <h3 className="tw__legalPage__body-content-title">9. Conditions of Use of the Site</h3>

            <div className="tw__legalPage__body-content-text">
              <p>As a condition to accessing or using the Site, you:</p>
              <ul>
                <li>
                  <b>Lawful Purposes.</b> Will only use the Site for lawful purposes and in accordance with these Terms.
                </li>
                <li>
                  <b>Accuracy.</b> Will ensure that all information that you provide on the Site is current, complete,
                  and accurate.
                </li>
                <li>
                  <b>Security.</b> Will maintain the security and confidentiality of access to your cryptocurrency
                  wallet address.
                </li>
                <li>
                  <b>Applicable Law.</b> Will comply with all applicable domestic and international laws, statutes,
                  ordinances and regulations applicable to your use of the Site. You agree that you are solely and
                  entirely responsible for compliance with all such applicable laws.
                </li>
              </ul>
            </div>

            <h3 className="tw__legalPage__body-content-title">10. Prohibited Activity</h3>

            <div className="tw__legalPage__body-content-text">
              <p>
                You agree not to engage in, or attempt to engage in, any of the following categories of prohibited
                activity in relation to your access and use of the Site:
              </p>
              <ul>
                <li>
                  <b>Intellectual Property Infringement.</b> Activity that infringes on or violates any copyright,
                  trademark, service mark, patent, right of publicity, right of privacy, or other proprietary or
                  intellectual property rights under the law.
                </li>
                <li>
                  <b>Cyberattack.</b> Activity that seeks to interfere with or compromise the integrity, security, or
                  proper functioning of any computer, server, network, personal device, or other information technology
                  system, including (but not limited to) the deployment of viruses and denial of service attacks.
                </li>
                <li>
                  <b>Criminal Proceeds.</b> Use or access the Site to transmit cryptoassets that are the direct or
                  indirect proceeds of any criminal or fraudulent activity, including, without limitation, terrorism or
                  tax evasion.
                </li>
                <li>
                  <b>Fraud and Misrepresentation.</b> Activity that seeks to defraud us or any other person or entity,
                  including (but not limited to) providing any false, inaccurate, or misleading information in order to
                  unlawfully obtain the property of another.
                </li>
                <li>
                  <b>Market Manipulation.</b> Activity that violates any applicable law, rule, or regulation concerning
                  the integrity of trading markets, including (but not limited to) the manipulative tactics commonly
                  known as spoofing and wash trading.
                </li>
                <li>
                  <b>Interference.</b> Use the Site in any manner that could interfere with, disrupt, negatively affect,
                  or inhibit other users from fully enjoying the Site, or that could damage, disable, overburden, or
                  impair the functioning of the Site in any manner.
                </li>
                <li>
                  <b>Circumvention.</b> Attempt to circumvent any content filtering techniques or security measures that
                  Tempus employs on the Site, or attempt to access any service or area of the Site that you are not
                  authorized to access.
                </li>
                <li>
                  <b>Automated Software.</b> Use any robot, spider, crawler, scraper, or other automated means or
                  interface not provided by us, to access the Site to extract data.
                </li>
                <li>
                  <b>Malware.</b> Introduce any malware, virus, trojan horse, worm, logic bomb, drop-dead device,
                  backdoor, shutdown mechanism or other harmful material into the Site.
                </li>
                <li>
                  <b>Unacceptable Content.</b> Post content or communications on the Site that are, in our sole
                  discretion, libelous, defamatory, profane, obscene, pornographic, sexually explicit, indecent, lewd,
                  vulgar, suggestive, harassing, hateful, threatening, offensive, discriminatory, bigoted, abusive,
                  inflammatory, fraudulent, deceptive or otherwise objectionable.
                </li>
                <li>
                  <b>Harassment.</b> Harass, abuse, or harm of another person or entity, including Tempus’ employees and
                  service providers.
                </li>
                <li>
                  <b>Impersonation.</b> Impersonate another user of the Site or otherwise misrepresent yourself.
                </li>
                <li>
                  <b>Unsolicited Promotions.</b> Post content on the Site containing unsolicited promotions, commercial
                  messages or any chain messages or user content designed to deceive or trick the user of the Site.
                </li>
                <li>
                  <b>Violation of Applicable Law.</b> Activity that violates any applicable law, rule, or regulation,
                  including, without limitation, any relevant and applicable laws concerning (a) anti-money laundering
                  and anti-terrorist financing, (b) privacy and data protection, and (c) the trading of securities or
                  derivatives.
                </li>
                <li>
                  <b>Any Other Unlawful Conduct.</b> Activity that violates any applicable law, rule, or regulation of
                  the Cayman Islands or another relevant jurisdiction, including (but not limited to) the restrictions
                  and regulatory requirements imposed by Cayman Islands law.
                </li>
                <li>
                  <b>Encouragement of Third Parties.</b> Encourage or induce any third party to engage in any of the
                  activities prohibited under these Terms.
                </li>
              </ul>
              If you are in any doubt as to whether or not your use of the Site involves a Prohibited Activity or if you
              have any other questions about how these requirements apply to you, please contact us at{' '}
              <a href="mailto:legal@tempus.finance">legal@tempus.finance.</a>
            </div>

            <h3 className="tw__legalPage__body-content-title">11. Not Registered with Any Government Agencies</h3>

            <p className="tw__legalPage__body-content-text">
              We are not registered with any government agencies as a national securities exchange or in any other
              capacity. No government agencies have reviewed or approved the use of Tempus-developed software. You
              understand and acknowledge that we do not broker swaps on your behalf. We also do not facilitate the
              execution or settlement of your swaps, which occur entirely on the public distributed blockchain.
            </p>

            <h3 className="tw__legalPage__body-content-title">12. Non-Solicitation and No Investment Advice</h3>

            <p className="tw__legalPage__body-content-text">
              You agree and understand that all swaps you submit through the Site are considered unsolicited, which
              means that you have not received any investment advice from us in connection with any swaps, and that we
              do not conduct a suitability review of any swaps you submit.
              <br />
              <br />
              All information provided by the Site is for informational purposes only and should not be construed as
              investment advice. You should not take, or refrain from taking, any action based on any information
              contained in the Site. We do not make any investment recommendations to you or opine on the merits of any
              investment transaction or opportunity. You alone are responsible for determining whether any investment,
              investment strategy or related transaction is appropriate for you based on your personal investment
              objectives, financial circumstances, and risk tolerance. We recommend that you seek independent financial
              advice if you are in any doubt.
            </p>

            <h3 className="tw__legalPage__body-content-title">13. Non-Custodial and No Fiduciary Duties</h3>

            <p className="tw__legalPage__body-content-text">
              The Site is a purely non-custodial application, meaning you are solely responsible for the custody of the
              cryptographic private keys to the digital asset wallets you hold. These Terms are not intended to, and do
              not, create or impose any fiduciary duties on us. To the fullest extent permitted by law, you acknowledge
              and agree that we owe no fiduciary duties or liabilities to you or any other party, and that to the extent
              any such duties or liabilities may exist at law or in equity, those duties and liabilities are hereby
              irrevocably disclaimed, waived, and eliminated. You further agree that the only duties and obligations
              that we owe you are those set out expressly in these Terms.
            </p>

            <h3 className="tw__legalPage__body-content-title">14. Financial and Technical Sophistication</h3>

            <p className="tw__legalPage__body-content-text">
              Any use or interaction with the Site requires a certain level of financial and technical sophistication to
              understand the inherent risks, including those listed in these Terms. By accessing and using the Site, you
              represent that you are financially and technically sophisticated enough to understand the inherent risks
              associated with using cryptographic and blockchain-based systems, and that you have a working knowledge of
              the usage and intricacies of digital assets such as Bitcoin (BTC), Ether (ETH), and other digital tokens
              such as those following the Ethereum Token Standard (ERC-20). In particular, you understand that
              blockchain-based transactions are irreversible.
              <br />
              <br />
              You further understand that the markets for these digital assets are highly volatile due to factors
              including (but not limited to) adoption, speculation, technology, security, and regulation. You
              acknowledge and accept that the cost and speed of transacting with cryptographic and blockchain-based
              systems are variable and may increase dramatically at any time. You further acknowledge and accept the
              risk that your digital assets may lose some or all of their value while they are supplied to the Site, you
              may suffer loss due to the fluctuation of prices of tokens in a pool, and experience significant price
              slippage and cost. You further acknowledge that we are not responsible for any of these variables or risks
              and cannot be held liable for any resulting losses that you experience while accessing or using the Site.
              Accordingly, you understand and agree to assume full responsibility for all of the risks of accessing and
              using the Site.
            </p>

            <h3 className="tw__legalPage__body-content-title">15. Third-Party Resources</h3>

            <p className="tw__legalPage__body-content-text">
              The Site may contain references or links to third-party resources, including (but not limited to)
              information, materials, products, or services, that we do not own or control. Any such references or links
              are provided for your information and convenience only. We do not endorse or assume any responsibility for
              any such resources. If you access any such resources, you do so at your own risk, and you understand that
              these Terms do not apply to your dealings or relationships with any third parties. Your use of a
              third-party site may be governed by the terms and conditions of that third-party site. You expressly
              relieve us of any and all liability arising from your use of any such resources, including for any damage
              or loss caused or alleged to be caused by or in connection with use of or reliance on any such resources.
            </p>

            <h3 className="tw__legalPage__body-content-title">16. Indemnity</h3>

            <p className="tw__legalPage__body-content-text">
              You agree to hold harmless, release, defend, and indemnify us and our officers, directors, employees,
              contractors, agents, affiliates, and subsidiaries from and against all claims, damages, obligations,
              losses, liabilities, costs, and expenses arising from: (a) your access and use of the Site; (b)
              cryptoassets associated with your wallet address; (c) your violation of any term or condition of these
              Terms, the right of any third party, or any other applicable law, rule, or regulation; and (d) any other
              party&apos;s access and use of the Site with your assistance or using any device or account that you own
              or control.
            </p>

            <h3 className="tw__legalPage__body-content-title">17. Limitation of Liability</h3>

            <p className="tw__legalPage__body-content-text">
              Under no circumstances shall we or any of our officers, directors, employees, contractors, agents,
              affiliates, or subsidiaries be liable to you for any indirect, punitive, incidental, special,
              consequential, or exemplary damages, including (but not limited to) damages for loss of profits, goodwill,
              use, data, or other intangible property, arising out of or relating to any access or use of the Site, nor
              will we be responsible for any damage, loss, or injury resulting from hacking, tampering, or other
              unauthorized access or use of the Site or the information contained within it. We assume no liability or
              responsibility for any: (a) errors, mistakes, or inaccuracies of content; (b) personal injury or property
              damage, of any nature whatsoever, resulting from any access or use of the Site; (c) unauthorized access or
              use of any secure server or database in our control, or the use of any information or data stored therein;
              (d) interruption or cessation of function related to the Site; (e) bugs, viruses, trojan horses, or the
              like that may be transmitted to or through the Site; (f) errors or omissions in, or loss or damage
              incurred as a result of the use of, any content made available through the Site; and (g) the defamatory,
              offensive, or illegal conduct of any third party.
              <br />
              <br />
              Under no circumstances shall we or any of our officers, directors, employees, contractors, agents,
              affiliates, or subsidiaries be liable to you for any claims, proceedings, liabilities, obligations,
              damages, losses, or costs in an amount exceeding (a) the amount of fees paid by you to Tempus under these
              Terms, if any, in the twelve month period immediately preceding the event giving rise to the claim for
              liability, or (b) USD $100.00, whichever is greater. This limitation of liability applies regardless of
              whether the alleged liability is based on contract, tort, negligence, strict liability, or any other
              basis, and even if we have been advised of the possibility of such liability. Some jurisdictions do not
              allow the exclusion of certain warranties or the limitation or exclusion of certain liabilities and
              damages. Accordingly, some of the disclaimers and limitations set forth in these Terms may not apply to
              you. This limitation of liability shall apply to the fullest extent permitted by law.
            </p>

            <h3 className="tw__legalPage__body-content-title">18. Dispute Resolution</h3>

            <p className="tw__legalPage__body-content-text">
              We will use our best efforts to resolve any potential disputes between us through informal, good faith
              negotiations. If a potential dispute arises, you must contact us by sending an email to{' '}
              <a href="mailto:legal@tempus.finance">legal@tempus.finance</a> so that we can attempt to resolve it
              without resorting to formal dispute resolution. If we aren&apos;t able to reach an informal resolution
              within sixty days of your email, then you and we both agree to resolve the potential dispute according to
              the process set forth under “Jurisdiction and Arbitration” below.
            </p>

            <h3 className="tw__legalPage__body-content-title">19. Class Action and Jury Trial Waiver</h3>

            <p className="tw__legalPage__body-content-text">
              With respect to all persons and entities, regardless of whether they have used the Site for personal,
              commercial or other purposes, all disputes, controversies or claims must be brought in the parties’
              individual capacity, and not as a plaintiff or class member in any purported class action, collective
              action, or other representative proceeding. This waiver applies to class arbitration, and unless we agree
              otherwise, the arbitrator may not consolidate more than one person’s claims. You agree that, by entering
              into the Terms, we are each waiving the right to a trial by jury or to participate in a class action,
              collective action, or other representative proceeding of any kind.
            </p>

            <h3 className="tw__legalPage__body-content-title">20. Jurisdiction and Arbitration</h3>

            <p className="tw__legalPage__body-content-text">
              Please read the following section carefully because it requires you to arbitrate certain disputes and
              claims with Tempus and limits how you can seek relief from Tempus. Also, arbitration precludes you from
              suing in court or having a jury trial.
              <br />
              <br />
              You agree that any dispute, controversy, or claim arising out of or in relation to these Terms, including
              the validity, invalidity, breach or termination thereof, and your use of the Site, or any other acts or
              omissions for which you may contend that we are liable, shall be settled by arbitration in accordance with
              the laws of the Cayman Islands. The arbitration shall be held on a confidential basis. The number of
              arbitrators shall be one or three; the seat of the arbitration shall be determined by the arbitrator(s);
              the arbitral proceedings shall be conducted in English. Unless we agree otherwise, the arbitrator(s) may
              not consolidate your claims with those of any other party.
              <br />
              <br />
              You further agree that the Site shall be deemed to be based solely in the Cayman Islands, and that
              although the Site may be available in other jurisdictions, its availability does not give rise to general
              or specific personal jurisdiction in any forum outside of the Cayman Islands.
            </p>

            <h3 className="tw__legalPage__body-content-title">21. Governing Law</h3>

            <p className="tw__legalPage__body-content-text">
              The governing law of these Terms and the Site shall be Cayman Islands law, without regard to principles of
              conflicts of laws.
            </p>

            <h3 className="tw__legalPage__body-content-title">22. Entire Agreement</h3>

            <p className="tw__legalPage__body-content-text">
              These Terms constitute the entire agreement between you and us with respect to the subject matter hereof
              (including, for the avoidance of doubt, your use of the Site). These Terms supersede any and all prior or
              contemporaneous written and oral agreements, communications and other understandings (if any) relating to
              the subject matter of the Terms.
            </p>

            <h3 className="tw__legalPage__body-content-title">23. General</h3>

            <p className="tw__legalPage__body-content-text">
              We may perform any of our obligations, and exercise any of the rights granted to us under these Terms,
              through a third-party. We may assign any or all our rights and obligations under these Terms to any
              third-party, in whole or in part, without notice or obtaining your consent or approval. You may not assign
              or transfer any right to use the Site, or any of your rights or obligations under these Terms, without our
              express prior written consent.
              <br />
              <br />
              If any clause or part of any clause of these Terms is found to be void, unenforceable or invalid, then it
              will be severed from these Terms, leaving the remainder in full force and effect, provided that the
              severance has not altered the basic nature of these Terms.
              <br />
              <br />
              Headings of sections of these Terms are for convenience only and shall not be used to limit or construe
              such sections.
              <br />
              <br />
              No single or partial exercise, or failure or delay in exercising any right, power or remedy by us shall
              constitute a waiver by us of, or impair or preclude any further exercise of, that or any right, power or
              remedy arising under these Terms or otherwise.
              <br />
              <br />
              If any of the provisions in these Terms are found to be illegal, invalid or unenforceable by any court of
              competent jurisdiction, the remainder shall continue in full force and effect.
              <br />
              <br />
              All disclaimers, indemnities and exclusions in these Terms shall survive termination of the Terms and
              shall continue to apply during any suspension or any period during which the Site is not available for you
              to use for any reason whatsoever.
              <br />
              <br />
              Except as otherwise expressly provided in these Terms, there shall be no third-party beneficiaries to
              these Terms.
            </p>

            <h3 className="tw__legalPage__body-content-title">24. Contact Us</h3>

            <p className="tw__legalPage__body-content-text">
              If you have any questions about these Terms, or wish to contact us for any reason, please send us an email
              at <a href="mailto:contact@tempus.finance">contact@tempus.finance.</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default memo(Terms);
