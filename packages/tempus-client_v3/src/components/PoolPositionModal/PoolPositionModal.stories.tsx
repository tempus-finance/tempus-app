import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Decimal } from 'tempus-core-services';
import { PoolPositionModal } from './PoolPositionModal';

export default {
  title: 'PoolPositionModal',
  component: PoolPositionModal,
  argTypes: {
    term: {
      control: {
        type: 'date',
      },
    },
  },
} as ComponentMeta<typeof PoolPositionModal>;

const Template: ComponentStory<typeof PoolPositionModal> = args => <PoolPositionModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  apr: 0.1,
  term: new Date(Date.UTC(2022, 2, 4)),
  profitLoss: new Decimal(10.29651),
  balance: new Decimal(20.9294),
  totalYieldEarned: new Decimal(1.12345),
  projectedTotalYield: new Decimal(3.181215),
  tokenExchangeRate: new Decimal(2000),
  tokenDecimals: 4,
  tokenTicker: 'ETH',
  chartData: [
    {
      x: new Date(Date.UTC(2022, 4, 20)),
      y: 1,
    },
    {
      x: new Date(Date.UTC(2022, 4, 21)),
      y: 4,
    },
    {
      x: new Date(Date.UTC(2022, 4, 22)),
      y: 3.4,
    },
    {
      x: new Date(Date.UTC(2022, 4, 23)),
      y: 5,
    },
  ],
};
