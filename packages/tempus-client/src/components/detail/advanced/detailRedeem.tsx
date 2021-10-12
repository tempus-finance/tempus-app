import { FC } from 'react';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import DetailRedeemBeforeMaturity from './detailRedeemBeforeMaturity';

type DetailRedeemProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
};

const DetailRedeem: FC<DetailRedeemProps> = props => {
  const { content, poolDataAdapter, tempusPool } = props;

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        {/* TODO - Check if pool matured, if it did, show DetailRedeemAfterMaturityUI */}
        <DetailRedeemBeforeMaturity content={content} poolDataAdapter={poolDataAdapter} tempusPool={tempusPool} />
      </div>
    </div>
  );
};

export default DetailRedeem;
