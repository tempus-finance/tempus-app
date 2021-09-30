import { FC, MouseEvent, useCallback, useState } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DetailPoolAddLiquidity from './detailPoolAddLiquidity';
import DetailPoolRemoveLiquidity from './detailPoolRemoveLiquidity';
import { DashboardRowChild } from '../../../interfaces';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import { JsonRpcSigner } from '@ethersproject/providers';
import { TempusPool } from '../../../interfaces/TempusPool';

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
        {view === 'remove' && <DetailPoolRemoveLiquidity content={content} />}
      </div>
    </div>
  );
};

export default DetailPool;
