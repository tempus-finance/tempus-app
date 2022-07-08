import { memo, useEffect } from 'react';
import Footer from '../Footer';
import Join from '../Join';
import BuyToken from './BuyToken';
import TokenBenefits from './TokenBenefits';
import TokenDistribution from './TokenDistribution';
import TokenInfo from '../TokenInfo';
import Token from './Token';
import TokenHeader from './TokenHeader';

import './TokenPage.scss';

const TokensPage = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tw__token">
      <TokenHeader />
      <TokenInfo />
      <TokenBenefits />
      <BuyToken />
      <Token />
      <TokenDistribution />
      <Join />
      <Footer />
    </div>
  );
};

export default memo(TokensPage);
