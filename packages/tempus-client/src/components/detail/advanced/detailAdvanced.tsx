import { FC, useState, ChangeEvent } from 'react';
import { Tab, Tabs } from '@material-ui/core';

import DetailMint from './detailMint';
import DetailSwap from './detailSwap';
import DetailPool from './detailPool';
import DetailRedeem from './detailRedeem';

import '../shared/style.scss';

type DetailAdvancedProps = {
  content?: any;
  isMaturity?: boolean;
};

const DetailAdvanced: FC<DetailAdvancedProps> = (props: DetailAdvancedProps) => {
  const { content, isMaturity } = props;
  const [tab, setTab] = useState<number>(0);

  const onTabChange = (event: ChangeEvent<{}>, value: number) => {
    setTab(value);
  };

  return (
    <>
      <Tabs value={tab} onChange={onTabChange} centered>
        <Tab label="Mint" className="tf__tab" />
        <Tab label="Swap" className="tf__tab" disabled={false} />
        <Tab label="Pool" className="tf__tab" />
        <Tab label="Redeem" className="tf__tab" />
      </Tabs>

      <DetailMint content={content} selectedTab={tab} />
      <DetailSwap content={content} selectedTab={tab} />
      <DetailPool content={content} selectedTab={tab} />
      <DetailRedeem content={content} selectedTab={tab} />
    </>
  );
};

export default DetailAdvanced;
