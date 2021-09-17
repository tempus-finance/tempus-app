import { FC, MouseEvent, useCallback, useState } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DetailPoolAddLiquidity from './detailPoolAddLiquidity';
import DetailPoolRemoveLiquidity from './detailPoolRemoveLiquidity';

type DetailPoolInProps = {
  content?: any;
  selectedTab: number;
};

type DetailPoolOutProps = {};

type DetailPoolProps = DetailPoolInProps & DetailPoolOutProps;

const DetailPool: FC<DetailPoolProps> = ({ content, selectedTab }) => {
  const [view, setView] = useState<string>('add');

  const switchView = useCallback(
    (event: MouseEvent<HTMLElement>, value) => {
      setView(value);
    },
    [setView],
  );

  return (
    <div role="tabpanel" hidden={selectedTab !== 2}>
      <div className="tf__dialog__content-tab">
        <div className="tf__dialog__swap-tab">
          <ToggleButtonGroup value={view} exclusive onChange={switchView} size="small">
            <ToggleButton value="add" aria-label="fixed APY">
              Add liquidity
            </ToggleButton>
            <ToggleButton value="remove" aria-label="variable APY">
              Remove Liquidity
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        {view === 'add' ? (
          <DetailPoolAddLiquidity content={content} />
        ) : (
          <DetailPoolRemoveLiquidity content={content} />
        )}
      </div>
    </div>
  );
};

export default DetailPool;
