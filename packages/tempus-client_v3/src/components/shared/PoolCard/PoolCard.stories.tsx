import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Decimal } from 'tempus-core-services';

import PoolCard from './PoolCard';

export default {
  title: 'PoolCard',
  component: PoolCard,
  argTypes: {},
} as ComponentMeta<typeof PoolCard>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const Template: ComponentStory<typeof PoolCard> = args => (
  <div style={style}>
    <PoolCard {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  ticker: 'ETH',
  protocol: 'lido',
  poolCardType: 'portfolio',
  poolCartStatus: 'Matured',
  apr: new Decimal(0.123),
  terms: [new Date(2022, 7, 2), new Date(2023, 3, 4)],
  aggregatedAPR: new Decimal(0.042),
  totalBalance: new Decimal(10186124),
  color: '#627EEA',
  multiplier: 2,
};
