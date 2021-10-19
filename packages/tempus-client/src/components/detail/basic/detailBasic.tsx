import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Tab, Tabs } from '@material-ui/core';
import { Context } from '../../../context';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import { TempusPool } from '../../../interfaces/TempusPool';
import { DashboardRowChild } from '../../../interfaces';
import DetailDeposit from './detailDeposit';
import DetailWithdraw from './detailWithdraw';

import '../shared/style.scss';

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
  const { data } = useContext(Context);

  const [tab, setTab] = useState<number>(0);

  const onTabChange = useCallback(
    (_: ChangeEvent<{}>, value: number) => {
      setTab(value);
    },
    [setTab],
  );

  // Hide 'Withdraw' tab if user does not have any balance in the pool.
  const withdrawVisible = useMemo(() => {
    if (data.userPrincipalsBalance && data.userYieldsBalance && data.userLPBalance) {
      return !data.userPrincipalsBalance.isZero() || !data.userYieldsBalance.isZero() || !data.userLPBalance.isZero();
    } else {
      return false;
    }
  }, [data.userLPBalance, data.userPrincipalsBalance, data.userYieldsBalance]);

  // Every time we hide withdraw tab, automatically switch to deposit tab
  useEffect(() => {
    if (!withdrawVisible) {
      setTab(0);
    }
  }, [withdrawVisible]);

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
        {withdrawVisible && (
          <Tab
            label={
              <Typography color="default" variant="h3">
                Withdraw
              </Typography>
            }
          />
        )}
      </Tabs>
      <Spacer size={25} />
      {tab === 0 && (
        <DetailDeposit
          content={content}
          tempusPool={tempusPool}
          signer={signer}
          userWalletAddress={userWalletAddress}
          poolDataAdapter={poolDataAdapter}
        />
      )}
      {tab === 1 && withdrawVisible && (
        <DetailWithdraw
          content={content}
          tempusPool={tempusPool}
          signer={signer}
          userWalletAddress={userWalletAddress}
          poolDataAdapter={poolDataAdapter}
        />
      )}
    </>
  );
};

export default DetailBasic;
