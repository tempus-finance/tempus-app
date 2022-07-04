import EthereumFoundationWhiteLogo from './logos/EthereumFoundationWhiteLogo';
import LinklatersWhiteLogo from './logos/LinklatersWhiteLogo';
import MicrosoftWhiteLogo from './logos/MicrosoftWhiteLogo';
import LendinvestWhiteLogo from './logos/LendinvestWhiteLogo';

const WorkedWith = (): JSX.Element => (
  <div className="tw__team__work-with">
    <h2 className="tw__team__worked-with__title">
      Our team has worked with some of the world&apos;s leading organizations
    </h2>
    <div className="tw__team__worked-with__separator" />
    <div className="tw__team__worked-with__organizations">
      <LinklatersWhiteLogo />
      <EthereumFoundationWhiteLogo />
      <MicrosoftWhiteLogo />
      <LendinvestWhiteLogo />
    </div>
  </div>
);

export default WorkedWith;
