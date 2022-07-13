import { FC, memo, useMemo } from 'react';
import AllenOveryLogo from './AllenOveryLogo';
import BankOfAmericaLogo from './BankOfAmericaLogo';
import BarclaycardLogo from './BarclaycardLogo';
import BNPLogo from './BNPLogo';
import EthereumFoundationLogo from './EthereumFoundationLogo';
import GoldmanSachsLogo from './GoldmanSachsLogo';
import IBMLogo from './IBMLogo';
import KirklandEllisLogo from './KirklandEllisLogo';
import LendinvestLogo from './LendinvestLogo';
import MicrosoftLogo from './MicrosoftLogo';
import NomuraLogo from './NomuraLogo';
import UBSLogo from './UBSLogo';

type CompanyLogoVariant =
  | 'bank-of-america'
  | 'bnp'
  | 'barclaycard'
  | 'goldman-sachs'
  | 'ubs'
  | 'lendinvest'
  | 'nomura'
  | 'ethereum-foundation'
  | 'microsoft'
  | 'allen-overy'
  | 'kirkland-ellis'
  | 'ibm';

interface CompanyLogoProps {
  variant: CompanyLogoVariant;
}

const CompanyLogo: FC<CompanyLogoProps> = ({ variant }) => {
  const logo = useMemo(() => {
    switch (variant) {
      case 'allen-overy':
        return <AllenOveryLogo />;
      case 'bank-of-america':
        return <BankOfAmericaLogo />;
      case 'barclaycard':
        return <BarclaycardLogo />;
      case 'bnp':
        return <BNPLogo />;
      case 'ethereum-foundation':
        return <EthereumFoundationLogo />;
      case 'goldman-sachs':
        return <GoldmanSachsLogo />;
      case 'ibm':
        return <IBMLogo />;
      case 'kirkland-ellis':
        return <KirklandEllisLogo />;
      case 'lendinvest':
        return <LendinvestLogo />;
      case 'microsoft':
        return <MicrosoftLogo />;
      case 'nomura':
        return <NomuraLogo />;
      case 'ubs':
        return <UBSLogo />;
      default:
        return null;
    }
  }, [variant]);

  return <div className="tw__team__worked-with__organization">{logo}</div>;
};

export default memo(CompanyLogo);
