import { FC, useMemo } from 'react';
import LinklatersOriginalLogo from './LinklatersOriginalLogo';
import LinklatersPlainLogo from './LinklatersPlainLogo';
import EthereumFoundationOriginalLogo from './EthereumFoundationOriginalLogo';
import EthereumFoundationPlainLogo from './EthereumFoundationPlainLogo';
import MicrosoftOriginalLogo from './MicrosoftOriginalLogo';
import MicrosoftPlainLogo from './MicrosoftPlainLogo';
import LendinvestOriginalLogo from './LendinvestOriginalLogo';
import LendinvestPlainLogo from './LendinvestPlainLogo';

type CompanyLogoVariant = 'linklaters' | 'ethereum-foundation' | 'microsoft' | 'lendinvest';

interface CompanyLogoProps {
  variant: CompanyLogoVariant;
}

const CompanyLogo: FC<CompanyLogoProps> = ({ variant }) => {
  const originalLogo = useMemo(() => {
    switch (variant) {
      case 'linklaters':
        return <LinklatersOriginalLogo />;
      case 'ethereum-foundation':
        return <EthereumFoundationOriginalLogo />;
      case 'microsoft':
        return <MicrosoftOriginalLogo />;
      case 'lendinvest':
        return <LendinvestOriginalLogo />;
      default:
        return null;
    }
  }, [variant]);

  const plainLogo = useMemo(() => {
    switch (variant) {
      case 'linklaters':
        return <LinklatersPlainLogo />;
      case 'ethereum-foundation':
        return <EthereumFoundationPlainLogo />;
      case 'microsoft':
        return <MicrosoftPlainLogo />;
      case 'lendinvest':
        return <LendinvestPlainLogo />;
      default:
        return null;
    }
  }, [variant]);

  return (
    <div className="tw__team__worked-with__organization">
      {originalLogo}
      {plainLogo}
    </div>
  );
};

export default CompanyLogo;
