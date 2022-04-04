import { ComponentStory, ComponentMeta } from '@storybook/react';

import WalletButton from './WalletButton';

export default {
  title: 'WalletButton',
  component: WalletButton,
  argTypes: {
    address: {
      control: {
        type: 'text',
      },
    },
    balance: {
      control: {
        type: 'text',
      },
    },
    chain: {
      control: {
        type: 'select',
        options: ['ethereum', 'fantom', 'ethereum-fork', 'unsupported'],
      },
    },
  },
} as ComponentMeta<typeof WalletButton>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof WalletButton> = args => (
  <div style={style}>
    <WalletButton {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  address: '0xAFE0B5E1bF4b9230A53e4A4715074ABf5B45F5de',
  balance: '34.2345',
  chain: 'ethereum',
  onConnect: () => {},
  onNetworkClick: () => {},
  onWalletClick: () => {},
};
