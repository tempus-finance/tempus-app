import { Config } from '../interfaces/Config';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tempusPools: [
    {
      address: '0x6320E6844EEEa57343d5Ca47D3166822Ec78b116',
      poolId: '0xf21bba788e1a6fe94a7c2f3be3ce350cd7843da30002000000000000000000f1',
      ammAddress: '0xF21BBa788E1a6fe94a7C2F3be3ce350Cd7843Da3',
      principalsAddress: '0x5A5cBa78Ae5ebd7142D0B8C796565388BA4B5732',
      yieldsAddress: '0x1f436309fBfB405192Acdc80d5C284De45e520EB',
      yieldBearingTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      backingTokenAddress: '0x0000000000000000000000000000000000000000',
      startDate: 1639157275000,
      maturityDate: 1648742400000,
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
    {
      address: '0x0697B0a2cBb1F947f51a9845b715E9eAb3f89B4F',
      poolId: '0x4b108592532f3a2826b9a902319e7a9199b2cfa50002000000000000000000f2',
      ammAddress: '0x4B108592532F3A2826B9a902319E7a9199B2cfA5',
      principalsAddress: '0x2C4AC125044e853F0f6d66b95365CBBa204fFCFD',
      yieldsAddress: '0xfFaCF0b02851e440FA207Ea2f9AfDF7FfE0bE095',
      yieldBearingTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      backingTokenAddress: '0x0000000000000000000000000000000000000000',
      startDate: 1639158404000,
      maturityDate: 1661875200000,
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
  tempusControllerContract: '0xdB5fD0678eED82246b599da6BC36B56157E4beD8',
  vaultContract: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  networkUrl: 'https://eth-goerli.alchemyapi.io/v2/RUE8LXWaELu4_nyMgfK99eX3DWoxLtDw',
  networkName: 'goerli',
  alchemyKey: 'Hz57g3uvMUx9K9mCmAODf75Wba8N2Fjp',
  lidoOracle: '0x24d8451BC07e7aF4Ba94F69aCDD9ad3c6579D9FB',
};
export default config;
