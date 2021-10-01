import { FC, MouseEvent, useCallback, useState } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { DashboardRowChild } from '../../../interfaces';
import { TempusPool } from '../../../interfaces/TempusPool';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';
import DetailPoolAddLiquidity from './detailPoolAddLiquidity';
import DetailPoolRemoveLiquidity from './detailPoolRemoveLiquidity';

type DetailPoolInProps = {
  content: DashboardRowChild;
  tempusPool: TempusPool;
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
};

type DetailPoolOutProps = {};

type DetailPoolProps = DetailPoolInProps & DetailPoolOutProps;

const DetailPool: FC<DetailPoolProps> = ({ content, poolDataAdapter, signer, userWalletAddress, tempusPool }) => {
  const [view, setView] = useState<'add' | 'remove'>('add');

  const switchView = useCallback(
    (event: MouseEvent<HTMLElement>, value) => {
      setView(value);
    },
    [setView],
  );

  return (
    <div role="tabpanel">
      <div className="tf__dialog__content-tab">
        <Spacer size={20} />
        <ToggleButtonGroup value={view} exclusive onChange={switchView}>
          <ToggleButton value="add">
            <Typography variant="body-text">Add Liquidity</Typography>
          </ToggleButton>
          <ToggleButton value="remove">
            <Typography variant="body-text">Remove Liquidity</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        <Spacer size={10} />
        {view === 'add' && (
          <DetailPoolAddLiquidity
            content={content}
            poolDataAdapter={poolDataAdapter}
            signer={signer}
            userWalletAddress={userWalletAddress}
            tempusPool={tempusPool}
          />
        )}
        {view === 'remove' && (
          <DetailPoolRemoveLiquidity content={content} poolDataAdapter={poolDataAdapter} tempusPool={tempusPool} />
        )}
      </div>
    </div>
  );
};

export default DetailPool;
