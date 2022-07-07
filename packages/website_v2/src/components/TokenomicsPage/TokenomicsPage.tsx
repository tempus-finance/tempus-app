import { memo, useEffect } from 'react';
import Footer from '../Footer';
import Join from '../Join';
import BuyToken from './BuyToken';
import TokenBenefits from './TokenBenefits';
import TokenDistribution from './TokenDistribution';
import TokenInfo from '../TokenInfo';
import Tokenomics from './Tokenomics';
import TokenomicsHeader from './TokenomicsHeader';

import './TokenomicsPage.scss';

const TokenomicsPage = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tw__tokenomics">
      <TokenomicsHeader />
      <TokenInfo />
      <TokenBenefits />
      <BuyToken />
      <Tokenomics />
      <TokenDistribution />
      <Join />
      <Footer />
    </div>
  );
};

export default memo(TokenomicsPage);
