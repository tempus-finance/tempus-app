import { Config } from '../interfaces/Config';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tempusPools: [
    {
      address: '0x5805D67782F23e193F4818A0B1e27fbb47086638',
      poolId: '0xc66a272890ef3c811afe718bceec0cad5e2cb286000200000000000000000043',
      ammAddress: '0xc66A272890Ef3C811afe718BcEec0cAD5E2Cb286',
      principalsAddress: '0x27d4F1b6999379ee9e5BE0D44fdF4b372Eb80854',
      yieldsAddress: '0x89dd29CaF097E706aA4D16D449d48496CeCb317B',
      yieldBearingTokenAddress: '0x209b1C2B038ef377f6f86d33C5Ca94d10ed9C89d',
      backingTokenAddress: '0x0000000000000000000000000000000000000000',
      startDate: 1638382591000,
      maturityDate: 1651363200000,
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
