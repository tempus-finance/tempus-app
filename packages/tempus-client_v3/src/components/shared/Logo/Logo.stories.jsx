import React from 'react';
import { Logo } from './Logo';

export default {
  title: 'Logo',
  component: Logo,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  padding: '10px',
};

const Template = args => (
  <div style={style}>
    <Logo {...args} size="small" />
    <Logo {...args} size="medium" />
    <Logo {...args} size="large" />
    <Logo {...args} size={48} />
  </div>
);

export const TokenETH = Template.bind({});
TokenETH.args = { variant: 'token', type: 'token-ETH' };

export const TokenETHLight = Template.bind({});
TokenETHLight.args = { variant: 'token', type: 'token-ETH-light' };

export const TokenUSDC = Template.bind({});
TokenUSDC.args = { variant: 'token', type: 'token-USDC' };

export const TokenUSDT = Template.bind({});
TokenUSDT.args = { variant: 'token', type: 'token-USDT' };

export const TokenDAI = Template.bind({});
TokenDAI.args = { variant: 'token', type: 'token-DAI' };

export const TokenFTM = Template.bind({});
TokenFTM.args = { variant: 'token', type: 'token-FTM' };

export const TokenMIM = Template.bind({});
TokenMIM.args = { variant: 'token', type: 'token-MIM' };

export const TokenRARI = Template.bind({});
TokenRARI.args = { variant: 'token', type: 'token-RARI' };

export const TokenYFI = Template.bind({});
TokenYFI.args = { variant: 'token', type: 'token-YFI' };

export const TokenWBTC = Template.bind({});
TokenWBTC.args = { variant: 'token', type: 'token-wBTC' };

export const TokenWBTCDark = Template.bind({});
TokenWBTCDark.args = { variant: 'token', type: 'token-wBTC-dark' };

export const TokenWETH = Template.bind({});
TokenWETH.args = { variant: 'token', type: 'token-wETH' };

export const TokenWFTM = Template.bind({});
TokenWFTM.args = { variant: 'token', type: 'token-wFTM' };

export const TokenStETH = Template.bind({});
TokenStETH.args = { variant: 'token', type: 'token-stETH' };

export const TokenYvUSDC = Template.bind({});
TokenYvUSDC.args = { variant: 'token', type: 'token-yvUSDC' };

export const TokenYvUSDT = Template.bind({});
TokenYvUSDT.args = { variant: 'token', type: 'token-yvUSDT' };

export const TokenYvDAI = Template.bind({});
TokenYvDAI.args = { variant: 'token', type: 'token-yvDAI' };

export const TokenYvBTC = Template.bind({});
TokenYvBTC.args = { variant: 'token', type: 'token-yvBTC' };

export const TokenYvYFI = Template.bind({});
TokenYvYFI.args = { variant: 'token', type: 'token-yvYFI' };

export const TokenYvwETH = Template.bind({});
TokenYvwETH.args = { variant: 'token', type: 'token-yvwETH' };

export const ProtocolAave = Template.bind({});
ProtocolAave.args = { variant: 'protocol', type: 'protocol-Aave' };

export const ProtocolLido = Template.bind({});
ProtocolLido.args = { variant: 'protocol', type: 'protocol-Lido' };

export const ProtocolRari = Template.bind({});
ProtocolRari.args = { variant: 'protocol', type: 'protocol-Rari' };

export const WalletMetamask = Template.bind({});
WalletMetamask.args = { variant: 'wallet', type: 'wallet-metamask' };

export const WalletWalletConnect = Template.bind({});
WalletWalletConnect.args = { variant: 'wallet', type: 'wallet-walletconnect' };

export const WalletGnosis = Template.bind({});
WalletGnosis.args = { variant: 'wallet', type: 'wallet-gnosis' };
