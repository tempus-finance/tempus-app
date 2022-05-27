import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Decimal, DEFAULT_TOKEN_PRECISION, Ticker } from 'tempus-core-services';
import { MaturityTerm } from '../shared/TermTabs';

import DepositModal from './DepositModal';

export const DepositModalResolver: FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { chain, ticker, protocol } = useParams();

  const [precision] = useState<number>(DEFAULT_TOKEN_PRECISION);
  const [startDate] = useState<Date>(new Date());
  const [maturityTerms] = useState<MaturityTerm[]>([{ apr: new Decimal('1'), date: new Date() }]);
  const singleCurrencyUsdRates = new Map<Ticker, Decimal>();

  console.log('modalResolver ===>', ticker, protocol, chain);

  singleCurrencyUsdRates.set('ETH', new Decimal(3500));

  const handleCloseModal = () => {
    navigate(-1);
  };

  return (
    <DepositModal
      open
      onClose={handleCloseModal}
      inputPrecision={precision}
      poolStartDate={startDate}
      maturityTerms={maturityTerms}
      usdRates={singleCurrencyUsdRates}
    />
  );
};
