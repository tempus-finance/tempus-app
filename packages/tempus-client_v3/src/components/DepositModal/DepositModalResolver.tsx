import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Decimal, DEFAULT_TOKEN_PRECISION } from 'tempus-core-services';
import { MaturityTerm } from '../../interfaces';

import DepositModal from './DepositModal';

export const DepositModalResolver: FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { chain, ticker, protocol } = useParams();

  const [startDate] = useState<Date>(new Date());
  const [maturityTerms] = useState<MaturityTerm[]>([{ apr: new Decimal('1'), date: new Date() }]);

  console.log('modalResolver ===>', ticker, protocol, chain);

  const handleCloseModal = () => {
    navigate(-1);
  };

  return (
    <DepositModal
      open
      onClose={handleCloseModal}
      poolStartDate={startDate}
      maturityTerms={maturityTerms}
      tokens={[
        {
          precision: DEFAULT_TOKEN_PRECISION,
          rate: new Decimal(2500),
          ticker: 'ETH',
        },
        {
          precision: DEFAULT_TOKEN_PRECISION,
          rate: new Decimal(2500),
          ticker: 'stETH',
        },
      ]}
    />
  );
};
