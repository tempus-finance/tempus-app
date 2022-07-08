import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Footer';
import Header from '../../Header';

const Privacy = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header color="#070b37" menuIconColor="light" />
      <div className="tw__legalPage">
        <div className="tw__legalPage__header">
          <div className="tw__legalPage__header-content">
            <h1 className="tw__legalPage__header-title">Tempus Privacy Policy</h1>
            <h2 className="tw__legalPage__header-subtitle">Last updated: 7 July 2021</h2>
          </div>
        </div>
        <div className="tw__legalPage__body">
          <div className="tw__legalPage__body-content">
            <h3 className="tw__legalPage__body-content-title">1. Introduction</h3>

            <p className="tw__legalPage__body-content-text">
              Tempus and its affiliates (hereinafter, “Tempus”, &quot;the Company&quot;, &quot;we&quot;, &quot;us&quot;
              or &quot;our&quot;) are committed to protecting and respecting your personal information. In addition, we
              recognize that persons who use Tempus value their privacy. This Privacy Policy together with our{' '}
              <Link to="/terms#top">Terms of Service</Link> governs our collection, processing and use of your Personal
              Information. By accessing Tempus, you are consenting to the information collection, use hold and
              disclosure practices as described in this Privacy Policy.
              <br />
              <br />
              Should we ask you to provide certain information by which you can be identified when using this website,
              then you can be assured that it will only be used in accordance with this Privacy Policy. This Privacy
              Policy applies to the operations of Tempus in the European Economic Area (EEA). It gives you rights by
              operation of the EU GDPR. If you live outside the EEA, Tempus will undertake best efforts to give you a
              similar degree of control over your privacy.
              <br />
              <br />
              If you wish to know more about this policy, please contact us via email at{' '}
              <a href="mailto:legal@tempus.finance">legal@tempus.finance</a>. By visiting our website, using our
              services or otherwise providing us with your personal information (or authorising it to be provided to us
              by someone else), you agree to your personal information being handled by Tempus as set out in this
              Privacy Policy.
            </p>

            <h3 className="tw__legalPage__body-content-title">2. Purpose of Privacy Policy</h3>

            <p className="tw__legalPage__body-content-text">
              The purpose of this Privacy Policy is to set out in an accountable and transparent way the collection and
              use of information by Tempus.
            </p>

            <h3 className="tw__legalPage__body-content-title">3. Personal Information</h3>

            <div className="tw__legalPage__body-content-text">
              <p>
                Personal information is information or an opinion about an identified individual, or an individual who
                is reasonably identifiable whether the information or opinion is true or not, and whether the
                information is recorded in a material form or not. The information includes but is not limited to:
              </p>
              <ul>
                <li>
                  Full legal name, address for service, e-mail address, phone number, date of birth, photographic
                  identification, government-issued identification and other contact details.
                </li>
                <li>
                  Tempus requires the highest level of browser permissions that could potentially lead to procurement of
                  more Personal Information than enclosed in the definition of Personal Information.
                </li>
                <li>
                  World Wide Web-related information, including but not limited to IP Addresses, operating system, the
                  website you came from and browser type may be received by Tempus as a result of your interactions with
                  Tempus.
                </li>
                <li>
                  Tempus uses Google Analytics for purposes of monitoring web traffic. Any identifying information
                  collected via Google Analytics is controlled by Google.
                </li>
                <li>
                  Ethereum blockchain and other public blockchains provide transparency into transactions and Tempus is
                  not responsible for preventing or managing information broadcasted on a blockchain.
                </li>
              </ul>
            </div>

            <h3 className="tw__legalPage__body-content-title">4. Purpose of Personal Information collection</h3>

            <div className="tw__legalPage__body-content-text">
              <p>Personal Information is collected in order to:</p>
              <ul>
                <li>Provide our services efficiently and effectively;</li>
                <li>Inform you about Tempus’ features;</li>
                <li>Develop, enhance, market and deliver products and services to you;</li>
                <li>Understand your needs and your eligibility for products and services;</li>
                <li>
                  Provide information to you about developments and new products, including changes and enhancements to
                  the Site;
                </li>
                <li>Conduct surveys and get feedback from you;</li>
                <li>Establish and maintain a responsible commercial relationship with you;</li>
                <li>Provide you with news and other matters of general interest to you as Tempus customer;</li>
                <li>
                  Meet Tempus’s legal and regulatory requirements (eg, information required to verify your identity).
                </li>
              </ul>
            </div>

            <h3 className="tw__legalPage__body-content-title">
              5. Security, Protection and Use of Personal Information
            </h3>

            <p className="tw__legalPage__body-content-text">
              Tempus is committed to protecting your privacy. Internally, only a specified number of employees within
              our business have access to your Personal Information.
              <br />
              <br />
              These employees have duties that reasonably require access to your Personal Information. We take the
              security of personal information very seriously and we take appropriate measures to ensure that personal
              information is not accessed or disclosed by anyone outside the terms of this policy. We will also take
              appropriate measures to prevent unauthorised access or alteration of your personal information. These
              measures include internal reviews, storage and processing practices and security measures as well as
              physical measures to prevent unauthorised access to systems where we store personal information.
              <br />
              <br />
              Tempus reserves the right to retain and share certain Personal Information in order to meet our regulatory
              and statutory requirements. In addition, Tempus reserves the right to retain and share certain Personal
              Information with our corporate partners, and third parties acting on behalf of Tempus.
              <br />
              <br />
              Personal Information and other related data may be exported outside of the jurisdiction in which you
              reside. Your Personal Information may be processed and stored in a foreign country or countries. Under
              those circumstances, the governments, courts, law enforcement or regulatory agencies of that country or
              those countries may be able to obtain access to your Personal Information through foreign laws. You need
              to be aware that the privacy standards of those countries may be lower than those of the jurisdiction in
              which you reside. You should note that you are not obliged to give your Personal Information to Tempus,
              but if you choose not to do so, we may not be able to provide our services, or your access to our services
              may be limited.
            </p>

            <h3 className="tw__legalPage__body-content-title">6. Direct Marketing</h3>

            <p className="tw__legalPage__body-content-text">
              From time to time, if you are a customer or a potential customer of Vega Protocol, we may contact you
              about our products as part of one of our campaigns, or to gain feedback on our services or marketing
              strategies. We may contact you via email. By signing up to our website you are consenting to this Privacy
              Policy and the receipt of our direct marketing messages. If you wish to no longer receive our direct
              marketing as outlined in this Privacy Policy, please unsubscribe from the emails via the link in their
              footer. Or send an email entitled “Unsubscribe” to the email address{' '}
              <a href="mailto:legal@tempus.finance">legal@tempus.finance</a>.
            </p>

            <h3 className="tw__legalPage__body-content-title">7. Consent</h3>

            <p className="tw__legalPage__body-content-text">
              Consent is required for the collection of Personal Information and the subsequent use or disclosure of
              Personal Information. The form of consent may vary depending upon the circumstances and the type of
              Personal information obtained. Your agreement with Tempus’s <Link to="/terms#top">Terms of Service</Link>{' '}
              constitutes your consent to the collection and use of Personal Information as described in this Privacy
              Policy. Tempus reserves the right to use and disclose Personal Information without your knowledge or
              consent as permitted by applicable law.
            </p>

            <h3 className="tw__legalPage__body-content-title">8. Disclosure of Personal Information</h3>

            <p className="tw__legalPage__body-content-text">
              We use the Personal Information for the purposes indicated at the time you provide us with such
              information, and/or otherwise for the purposes set out in this Privacy Policy and/or as otherwise
              permitted by law. We may make available the Personal Information that you provide to us to our affiliates,
              agents, representatives, service providers and contractors for these purposes. We also reserve the right
              to disclose Personal information that Tempus believes, in good faith, is appropriate or necessary to
              enforce our Terms of Use, take precautions against liability or harm, to investigate and respond to
              third-party claims or allegations, to respond to a court order or official requests, to protect security
              or integrity of Tempus and to protect the rights, property or safety of Tempus, our uses or others.
              <br />
              <br />
              We may share Users&apos; Personal Information with any financial dispute resolution scheme to which the
              Company subscribes, and other law enforcement bodies, regulatory agencies, courts, arbitration bodies and
              dispute resolution schemes, both in Switzerland and internationally, as may be required by law.
              <br />
              <br />
              If you request it in writing, we may share your Personal Information with your nominated advisers. Except
              where disclosure of your Personal Information is required by law or requested by you, we will generally
              require any third party which receives or has access to Personal Information to protect such Personal
              Information and to use it only to carry out the services they are performing for you or for us unless
              otherwise required or permitted by law. We will ensure that any such third party is aware of our
              obligations under this Privacy Policy and we will take reasonable steps to ensure that contracts we enter
              with such third parties bind them to terms no less protective of any Personal Information disclosed to
              them than the obligations we undertake to you under this Privacy Policy or which are imposed on us under
              applicable data protection laws.
              <br />
              <br />
              In the event that Tempus is involved in a merger, acquisition, sale, bankruptcy, insolvency,
              reorganization, receivership, assignment or the application of laws or change of control, there may be a
              disclosure of your information to another entity related to such an event.
            </p>

            <h3 className="tw__legalPage__body-content-title">9. Access and Changing of Personal Information</h3>

            <p className="tw__legalPage__body-content-text">
              We take all reasonable steps to ensure your personal information is accurate and up to date. If we believe
              that it is not accurate, we may contact you to update your personal information. If you believe the
              personal information that we have stored about you is inaccurate you may contact us via{' '}
              <a href="mailto:legal@tempus.finance">legal@tempus.finance</a>. to change the personal information we have
              stored. Where we do receive unsolicited personal information, we will determine whether or not it would
              have been permissible to collect that information if it had been solicited. If we determine that it would
              not have been permissible by law to collect the information, we will destroy or de-identify that personal
              information as soon as practicable. You may also ask us to send you the personal information we have about
              you. If you would like to access this information, please contact us on the above email. You may also
              request the deletion or destruction of your Personal Information, your Account details, or your
              Transaction details by sending an email to us. Tempus will act on your request only when it is not
              inconsistent with its legal and regulatory obligations and compliance procedures. Upon your written
              request, we will inform you of the use and general disclosure of your Personal Information. Depending on
              the nature of your request, there may be a minimal charge for accessing your Personal Information.
            </p>

            <h3 className="tw__legalPage__body-content-title">10. Cookies</h3>

            <p className="tw__legalPage__body-content-text">
              A cookie is a small file that asks permission to be placed on your computer’s hard drive. Once you agree,
              the file is added and the cookie helps analyse web traffic or lets you know when you visit a particular
              site. Cookies allow web applications to respond to you as an individual. The web application can tailor
              its operations to your needs, likes and dislikes by gathering and remembering information about your
              preferences. We have chosen to use cookies that will improve your experience of using the website and also
              ensure your privacy is protected and respected at all times.
              <br />
              <br />
              Before the Website places Cookies on your computer, you will be presented with a message bar requesting
              your consent to set those Cookies. By giving your consent to the placing of Cookies, you are enabling
              Tempus to provide a better experience and service to you. You may, if you wish, deny consent to the
              placing of Cookies; however certain features of the Website may not function fully or as intended.
              <br />
              <br />
              We aim to use traffic log cookies to identify the pages being used. We will also be using
              performance-related cookies to recognise and count the visitors on our website and how our visitors move
              around our website when they use it.
              <br />
              <br />
              It is recommended that you ensure that your internet browser is up-to-date and that you consult the help
              and guidance provided by the developer of your internet browser if you are unsure about adjusting your
              privacy settings. For more information generally on cookies, including how to disable them, please refer
              to aboutcookies.org. You will also find details on how to delete cookies from your computer.
            </p>

            <h3 className="tw__legalPage__body-content-title">11. Overseas Disclosure</h3>

            <p className="tw__legalPage__body-content-text">
              Some of our providers may be located, or have some of their business functions located in countries
              outside of the EU. As part of our business, we will be required to disclose your personal information to
              these companies, we will take such steps as are reasonable in the circumstances to ensure that these
              companies do not breach EU privacy legislation in relation to your personal information. Please contact us
              if you have any questions regarding Vega Protocol’s Privacy Policy or would like us to send you a copy of
              this policy. Our Privacy Policy may be amended from time to time. The current version will be posted on
              our website.
            </p>

            <h3 className="tw__legalPage__body-content-title">12. Retention of Personal Information</h3>

            <p className="tw__legalPage__body-content-text">
              We will hold your Personal Information only for as long as it is necessary for us to do so, having regard
              to the purposes described in this Privacy Policy and our own legal and regulatory requirements. In
              general, Personal Information relating to your Account for at least a period of 5 years after your Account
              is closed. Similarly, we usually retain information about Transactions on your Account for a period of 5
              years from the date of the Transaction. Personal Information which is collected for other purposes will be
              discarded in accordance with our policies in place from time to time.
            </p>

            <h3 className="tw__legalPage__body-content-title">13. Users Under Age of 13</h3>

            <p className="tw__legalPage__body-content-text">
              Tempus does not knowingly collect or store any personal information about children under 13 without
              verifiable prior parental consent. If you believe such information has been inadvertently collected, we
              will take the necessary steps in order to remove such information from our database. Users under 13 must
              seek and obtain parental consent to use this website.
            </p>

            <h3 className="tw__legalPage__body-content-title">14. Links</h3>

            <p className="tw__legalPage__body-content-text">
              There may be links from our Site to other sites and resources provided by third parties. This Privacy
              Policy applies only to our Site. Accessing those third-party sites or sources requires you to leave our
              Site. We do not control those third-party sites or any of the content contained therein and you agree that
              we are in no way responsible or liable for any of those third-party sites, including, without limitation,
              their content, policies, failures, promotions, products, services or actions and/or any damages, losses,
              failures or problems caused by, related to or arising from those sites. We encourage you to review all
              policies, rules, terms and regulations, including the privacy policies, of each site that you visit.
            </p>

            <h3 className="tw__legalPage__body-content-title">15. Changes</h3>

            <p className="tw__legalPage__body-content-text">
              Our policies, content, information, promotions, disclosures, disclaimers and features may be revised,
              modified, updated, and/or supplemented at any time and without prior notice at the sole and absolute
              discretion of the Company. Users will be able to check the last date when the Privacy Policy is updated.
            </p>

            <h3 className="tw__legalPage__body-content-title">16. Contact Us</h3>

            <p className="tw__legalPage__body-content-text">
              If you have any questions, comments, or concerns regarding our Privacy Policy and/or practices, please
              contact us at <a href="mailto:legal@tempus.finance">legal@tempus.finance</a>. We will get back to you if
              required as soon as possible and within 14 days.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default memo(Privacy);
