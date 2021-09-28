import { FC, useState, ChangeEvent } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Tab, Tabs } from '@material-ui/core';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';
import DetailSwap from './detailSwap';

import '../shared/style.scss';

type DetailAdvancedProps = {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  userWalletAddress: string;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
};

const DetailAdvanced: FC<DetailAdvancedProps> = (props: DetailAdvancedProps) => {
  const { content, userWalletAddress, poolDataAdapter, signer, tempusPool } = props;
  const [tab, setTab] = useState<number>(0);

  const onTabChange = (event: ChangeEvent<{}>, value: number) => {
    setTab(value);
  };

  return (
    <>
      <Tabs value={tab} onChange={onTabChange} centered>
        <Tab
          label={
            <Typography color="default" variant="h3">
              Swap
            </Typography>
          }
          className="tf__tab"
        />
      </Tabs>

      {tab === 0 && (
        <DetailSwap
          content={content}
          userWalletAddress={userWalletAddress}
          poolDataAdapter={poolDataAdapter}
          signer={signer}
          tempusPool={tempusPool}
        />
      )}
    </>
  );
};

export default DetailAdvanced;
