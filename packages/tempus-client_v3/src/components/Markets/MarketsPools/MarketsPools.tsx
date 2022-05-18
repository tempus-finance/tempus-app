import { Decimal, tokenColorMap } from 'tempus-core-services';
import { usePoolList } from '../../../hooks';
import { PoolCard } from '../../shared';
import './MarketsPools.scss';

const MarketsPools = (): JSX.Element => {
  const tempusPools = usePoolList();

  return (
    <div className="tc__marketsPools">
      {tempusPools.map(tempusPool => {
        const cardColor = tokenColorMap.get(tempusPool.backingToken);

        if (!cardColor) {
          console.warn(`Missing ${tempusPool.backingToken} token color in tokenColorMap!`);
        }

        return (
          <PoolCard
            key={`${tempusPool.chain}-${tempusPool.address}`}
            aprValues={[new Decimal(0.1)]}
            color={cardColor || '#ffffff'}
            poolCardStatus="Fixed"
            poolCardVariant="markets"
            ticker={tempusPool.backingToken}
            protocol="aave"
            terms={[new Date(4, 5, 2023)]}
          />
        );
      })}
    </div>
  );
};
export default MarketsPools;
