import { memo, useEffect } from 'react';
import Footer from '../Footer';
import Join from '../Join';
import BuyToken from './BuyToken';
import TokenBenefits from './TokenBenefits';
import TokenInfo from './TokenInfo';
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
      <Join />
      <Footer />
    </div>
  );
};

export default memo(TokenomicsPage);
