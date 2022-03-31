import React from 'react';
import Logo from './Logo';

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
TokenETH.args = { type: 'token-ETH' };

export const TokenETHLight = Template.bind({});
TokenETHLight.args = { type: 'token-ETH-light' };

export const TokenUSDC = Template.bind({});
TokenUSDC.args = { type: 'token-USDC' };

export const TokenUSDT = Template.bind({});
TokenUSDT.args = { type: 'token-USDT' };

export const TokenDAI = Template.bind({});
TokenDAI.args = { type: 'token-DAI' };

export const TokenFTM = Template.bind({});
TokenFTM.args = { type: 'token-FTM' };

export const TokenMIM = Template.bind({});
TokenMIM.args = { type: 'token-MIM' };

export const TokenRARI = Template.bind({});
TokenRARI.args = { type: 'token-RARI' };

export const TokenYFI = Template.bind({});
TokenYFI.args = { type: 'token-YFI' };

export const TokenWBTC = Template.bind({});
TokenWBTC.args = { type: 'token-wBTC' };

export const TokenWBTCDark = Template.bind({});
TokenWBTCDark.args = { type: 'token-wBTC-dark' };

export const TokenWETH = Template.bind({});
TokenWETH.args = { type: 'token-wETH' };

export const TokenWFTM = Template.bind({});
TokenWFTM.args = { type: 'token-wFTM' };

export const TokenStETH = Template.bind({});
TokenStETH.args = { type: 'token-stETH' };

export const TokenYvUSDC = Template.bind({});
TokenYvUSDC.args = { type: 'token-yvUSDC' };

export const TokenYvUSDT = Template.bind({});
TokenYvUSDT.args = { type: 'token-yvUSDT' };

export const TokenYvDAI = Template.bind({});
TokenYvDAI.args = { type: 'token-yvDAI' };

export const TokenYvBTC = Template.bind({});
TokenYvBTC.args = { type: 'token-yvBTC' };

export const TokenYvYFI = Template.bind({});
TokenYvYFI.args = { type: 'token-yvYFI' };

export const TokenYvwETH = Template.bind({});
TokenYvwETH.args = { type: 'token-yvwETH' };

export const ProtocolAave = Template.bind({});
ProtocolAave.args = { type: 'protocol-Aave' };

export const ProtocolLido = Template.bind({});
ProtocolLido.args = { type: 'protocol-Lido' };

export const ProtocolRari = Template.bind({});
ProtocolRari.args = { type: 'protocol-Rari' };

export const WalletMetamask = Template.bind({});
WalletMetamask.args = { type: 'wallet-metamask' };

export const WalletWalletConnect = Template.bind({});
WalletWalletConnect.args = { type: 'wallet-walletconnect' };

export const WalletGnosis = Template.bind({});
WalletGnosis.args = { type: 'wallet-gnosis' };
