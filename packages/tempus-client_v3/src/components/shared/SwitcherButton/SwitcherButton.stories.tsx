import { ComponentStory } from '@storybook/react';
import React from 'react';
import SwitcherButton from './SwitcherButton';

export default {
  title: 'SwitcherButton',
  component: SwitcherButton,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof SwitcherButton> = args => (
  <div style={style}>
    <SwitcherButton {...args} />
  </div>
);

export const FantomButton1 = Template.bind({});
FantomButton1.args = {
  logoType: 'token-FTM',
  label: 'Fantom',
  title: 'Fantom',
  selected: true,
  onClick: () => console.log('Fantom'),
};

export const FantomButton2 = Template.bind({});
FantomButton2.args = {
  logoType: 'token-FTM',
  label: 'Fantom',
  title: 'Fantom',
  selected: false,
  onClick: () => console.log('Fantom'),
};

export const EthereumButton1 = Template.bind({});
EthereumButton1.args = {
  logoType: 'token-ETH',
  label: 'Ethereum',
  title: 'Ethereum',
  selected: true,
  onClick: () => console.log('Ethereum'),
};

export const EthereumButton2 = Template.bind({});
EthereumButton2.args = {
  logoType: 'token-ETH',
  label: 'Ethereum',
  title: 'Ethereum',
  selected: false,
  onClick: () => console.log('Ethereum'),
};

export const MetamaskButton1 = Template.bind({});
MetamaskButton1.args = {
  logoType: 'wallet-metamask',
  label: 'Metamask',
  title: 'Metamask',
  selected: true,
  onClick: () => console.log('Metamask'),
};

export const MetamaskButton2 = Template.bind({});
MetamaskButton2.args = {
  logoType: 'wallet-metamask',
  label: 'Metamask',
  title: 'Metamask',
  selected: false,
  onClick: () => console.log('Metamask'),
};
