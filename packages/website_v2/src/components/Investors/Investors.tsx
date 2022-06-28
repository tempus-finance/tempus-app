import {
  DistributedGlobalLogo,
  GSRLogo,
  JumpCapitalLogo,
  KojiLogo,
  LaunchHubLogo,
  LemniscapLogo,
  SupernovaLogo,
  TomahawkVCLogo,
  WintermuteLogo,
} from '../../icons';

import './Investors.scss';

const Investors = (): JSX.Element => (
  <div className="tw__investors">
    <h2 className="tw__section-title">Our Investors</h2>

    <div className="tw__investors-separator" />

    <div className="tw__investors_logos">
      <TomahawkVCLogo />
      <KojiLogo />
      <DistributedGlobalLogo />
      <WintermuteLogo />
      <GSRLogo />
      <LemniscapLogo />
      <LaunchHubLogo />
      <SupernovaLogo />
      <JumpCapitalLogo />
    </div>
  </div>
);

export default Investors;
