import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Decimal } from 'tempus-core-services';
import PoolPositionCard from './PoolPositionCard';

export default {
  title: 'PoolPositionCard',
  component: PoolPositionCard,
  argTypes: {
    term: {
      control: {
        type: 'date',
      },
    },
  },
} as ComponentMeta<typeof PoolPositionCard>;

const style = {
  display: 'flex',
  paddingTop: '50px',
  height: '300px',
  width: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const Template: ComponentStory<typeof PoolPositionCard> = args => (
  <div style={style}>
    <PoolPositionCard {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  apr: 0.1,
  term: new Date(2022, 2, 4),
  profitLoss: new Decimal(10.29651),
  balance: new Decimal(20.9294),
  totalYieldEarned: new Decimal(1.12345),
  projectedTotalYield: new Decimal(3.181215),
  tokenExchangeRate: new Decimal(2000),
  tokenDecimals: 4,
  tokenTicker: 'ETH',
};
