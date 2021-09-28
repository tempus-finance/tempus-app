import { ChangeEvent, FC, useCallback, useState } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Tab, Tabs } from '@material-ui/core';
import Typography from '../../typography/Typography';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import { TempusPool } from '../../../interfaces/TempusPool';
import { DashboardRowChild } from '../../../interfaces';
import DetailDeposit from './detailDeposit';
import DetailWithdraw from './detailWithdraw';

import '../shared/style.scss';
import Spacer from '../../spacer/spacer';

type DetailBasicInProps = {
  signer: JsonRpcSigner | null;
  tempusPool: TempusPool;
  userWalletAddress: string;
  poolDataAdapter: PoolDataAdapter | null;
  content: DashboardRowChild;
};

type DetailBasicProps = DetailBasicInProps;

const DetailBasic: FC<DetailBasicProps> = ({
  tempusPool,
  signer,
  content,
  userWalletAddress,
  poolDataAdapter,
}: DetailBasicProps) => {
  const [tab, setTab] = useState<number>(0);

  const onTabChange = useCallback(
    (_: ChangeEvent<{}>, value: number) => {
      setTab(value);
    },
    [setTab],
  );

  return (
    <>
      <Tabs value={tab} onChange={onTabChange} centered>
        <Tab
          label={
            <Typography color="default" variant="h3">
              Deposit
            </Typography>
          }
        />
        <Tab
          label={
            <Typography color="default" variant="h3">
              Withdraw
            </Typography>
          }
        />
      </Tabs>
      <DetailDeposit
        selectedTab={tab}
        content={content}
        tempusPool={tempusPool}
        signer={signer}
        userWalletAddress={userWalletAddress}
        poolDataAdapter={poolDataAdapter}
      />
      <DetailWithdraw
        selectedTab={tab}
        content={content}
        tempusPool={tempusPool}
        signer={signer}
        userWalletAddress={userWalletAddress}
        poolDataAdapter={poolDataAdapter}
      />
    </>
  );
};

export default DetailBasic;
