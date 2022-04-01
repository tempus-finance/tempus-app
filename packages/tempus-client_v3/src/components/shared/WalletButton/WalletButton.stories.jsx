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
    ticker: {
      control: {
        type: 'text',
      },
    },
    network: {
      control: {
        type: 'select',
        options: ['ethereum', 'fantom', 'ethereum-fork'],
      },
    },
  },
};

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template = args => (
  <div style={style}>
    <WalletButton {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  address: '0xAFE0B5E1bF4b9230A53e4A4715074ABf5B45F5de',
  balance: '34.2345',
  ticker: 'ETH',
  network: 'ethereum',
};
