import { FC } from 'react';
import { useParams } from 'react-router-dom';

const ModalResolver: FC = () => {
  const { chain, ticker, protocol } = useParams();

  return (
    <div>
      Here the DepositModal: {chain} {ticker} {protocol}
    </div>
  );
};

export default ModalResolver;
