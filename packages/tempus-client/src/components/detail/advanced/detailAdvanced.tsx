import { FC, useState, ChangeEvent } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Tab, Tabs } from '@material-ui/core';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import DetailSwap from './detailSwap';
import DetailMint from './detailMint';
import DetailPool from './detailPool';
import DetailRedeem from './detailRedeem';

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
              Mint
            </Typography>
          }
          className="tf__tab"
        />
        <Tab
          label={
            <Typography color="default" variant="h3">
              Swap
            </Typography>
          }
          className="tf__tab"
        />
        <Tab
          label={
            <Typography color="default" variant="h3">
              Pool
            </Typography>
          }
          className="tf__tab"
        />
        <Tab
          label={
            <Typography color="default" variant="h3">
              Redeem
            </Typography>
          }
          className="tf__tab"
        />
      </Tabs>
      <Spacer size={25} />
      {tab === 0 && (
        <DetailMint
          content={content}
          poolDataAdapter={poolDataAdapter}
          signer={signer}
          tempusPool={tempusPool}
          userWalletAddress={userWalletAddress}
        />
      )}
      {tab === 1 && (
        <DetailSwap
          content={content}
          userWalletAddress={userWalletAddress}
          poolDataAdapter={poolDataAdapter}
          signer={signer}
          tempusPool={tempusPool}
        />
      )}
      {tab === 2 && (
        <DetailPool
          content={content}
          poolDataAdapter={poolDataAdapter}
          signer={signer}
          userWalletAddress={userWalletAddress}
          tempusPool={tempusPool}
        />
      )}
      {tab === 3 && <DetailRedeem content={content} poolDataAdapter={poolDataAdapter} tempusPool={tempusPool} />}
    </>
  );
};

export default DetailAdvanced;
