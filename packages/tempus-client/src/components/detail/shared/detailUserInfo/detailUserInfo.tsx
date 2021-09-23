import { FC, useState } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { JsonRpcSigner } from '@ethersproject/providers';
import { DashboardRowChild } from '../../../../interfaces';
import { TempusPool } from '../../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../../adapters/PoolDataAdapter';
import Typography from '../../../typography/Typography';
import Spacer from '../../../spacer/spacer';
import DetailUserInfoBalance from './detailUserInfoBalance';
import DetailUserInfoTransactions from './detailUserInfoTransactions';

import './detailUserInfo.scss';

enum TabValue {
  'BALANCE' = 0,
  'TRANSACTIONS' = 1,
}

interface DetailUserInfoProps {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
}

const DetailUserInfo: FC<DetailUserInfoProps> = props => {
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.BALANCE);

  const onTabChange = (_: React.ChangeEvent<{}>, value: TabValue) => {
    setActiveTab(value);
  };

  return (
    <>
      <Tabs value={activeTab} onChange={onTabChange} centered>
        <Tab
          label={
            <Typography color="default" variant="h3">
              Balance
            </Typography>
          }
        />
        <Tab
          label={
            <Typography color="default" variant="h3">
              Transactions
            </Typography>
          }
        />
      </Tabs>
      <Spacer size={25} />
      {activeTab === TabValue.BALANCE && (
        <DetailUserInfoBalance
          content={props.content}
          poolDataAdapter={props.poolDataAdapter}
          tempusPool={props.tempusPool}
          signer={props.signer}
          userWalletAddress={props.userWalletAddress}
        />
      )}
      {activeTab === TabValue.TRANSACTIONS && (
        <DetailUserInfoTransactions
          poolDataAdapter={props.poolDataAdapter}
          userWalletAddress={props.userWalletAddress}
          tempusPool={props.tempusPool}
        />
      )}
    </>
  );
};
export default DetailUserInfo;
