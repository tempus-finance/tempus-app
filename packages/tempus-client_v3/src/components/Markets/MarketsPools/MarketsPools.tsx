import { Decimal } from 'tempus-core-services';
import { usePoolList } from '../../../hooks';
import { PoolCard } from '../../shared';
import './MarketsPools.scss';

const MarketsPools = (): JSX.Element => {
  const tempusPools = usePoolList();

  return (
    <div className="tc__marketsPools">
      {tempusPools.map(tempusPool => (
        <PoolCard
          key={`${tempusPool.chain}-${tempusPool.address}`}
          aprValues={[new Decimal(0.1)]}
          color="#ff5500"
          poolCardStatus="Fixed"
          poolCardVariant="markets"
          ticker={tempusPool.backingToken}
          protocol="aave"
          terms={[new Date(4, 5, 2023)]}
        />
      ))}
    </div>
  );
};
export default MarketsPools;
