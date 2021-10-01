import { FC, MouseEvent, useCallback, useState } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DetailEarlyRedeem from './detailEarlyRedeem';
import DetailNormalRedeem from './detailNormalRedeem';

type DetailRedeemProps = {
  content?: any;
  selectedTab: number;
};

const DetailRedeem: FC<DetailRedeemProps> = ({ content, selectedTab }) => {
  const [view, setView] = useState<string>('early');

  const switchView = useCallback(
    (event: MouseEvent<HTMLElement>, value) => {
      setView(value);
    },
    [setView],
  );

  return (
    <div role="tabpanel" hidden={selectedTab !== 3}>
      <div className="tf__dialog__content-tab">
        <div className="tf__dialog__swap-tab">
          <ToggleButtonGroup value={view} exclusive onChange={switchView} size="small">
            <ToggleButton value="early">Early Redeem</ToggleButton>
            <ToggleButton value="redeem">Redeem</ToggleButton>
          </ToggleButtonGroup>
        </div>
        {view === 'early' ? <DetailEarlyRedeem content={content} /> : <DetailNormalRedeem content={content} />}
      </div>
    </div>
  );
};

export default DetailRedeem;
