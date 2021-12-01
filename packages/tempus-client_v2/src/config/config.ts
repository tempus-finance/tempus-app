import { Config } from '../interfaces/Config';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tempusPools: [
    {
      address: '0xe0D7829484DD3619C6ee5B701e09a43BF75116BF',
      poolId: '0x39b81aedf7cdb68e66c20f20a16cb433e0361d3b000200000000000000000042',
      ammAddress: '0x39B81AEDf7CdB68E66C20f20a16cb433e0361d3b',
      principalsAddress: '0x0F796423402E5E24210Cd538973855BCAcb42411',
      yieldsAddress: '0xa0cf2C8f1Eac72FDd8562710B3D3b6b2AAdDb0C0',
      yieldBearingTokenAddress: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',
      backingTokenAddress: '0x0000000000000000000000000000000000000000',
      startDate: 1638357310000,
      maturityDate: 1646092800000,
      protocol: 'lido',
      backingToken: 'ETH',
      yieldBearingToken: 'stETH',
      spotPrice: '2',
      decimalsForUI: 4,
      tokenPrecision: {
        backingToken: 18,
        lpTokens: 18,
        principals: 18,
        yieldBearingToken: 18,
        yields: 18,
      },
    },
  ],
  statisticsContract: '0x01fF82791D8414826ec7390dfE7902703F632F5C',
  tempusControllerContract: '0x8E8f7485f0d4b8b27A0660286d2eEA04e9e1caB9',
  vaultContract: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  networkUrl: 'https://eth-goerli.alchemyapi.io/v2/RUE8LXWaELu4_nyMgfK99eX3DWoxLtDw',
  networkName: 'goerli',
  alchemyKey: 'Hz57g3uvMUx9K9mCmAODf75Wba8N2Fjp',
  lidoOracle: '0x24d8451BC07e7aF4Ba94F69aCDD9ad3c6579D9FB',
};
export default config;
