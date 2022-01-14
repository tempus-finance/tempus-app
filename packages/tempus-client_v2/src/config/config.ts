import { Config } from '../interfaces/Config';

// const GOERLI_ALCHEMY_KEY = process.env.REACT_APP_GOERLI_ALCHEMY_KEY || '';
// const GOERLI_ALCHEMY_CONFIG = {
//   networkUrl: 'https://eth-goerli.alchemyapi.io/v2/${GOERLI_ALCHEMY_KEY}',
//   networkName: 'goerli',
//   alchemyKey: GOERLI_ALCHEMY_KEY,
// } as Config;

const MAINNET_ALCHEMY_KEY = process.env.REACT_APP_MAINNET_ALCHEMY_KEY || '';
const MAINNET_ALCHEMY_CONFIG = {
  networkUrl: `https://eth-mainnet.alchemyapi.io/v2/${MAINNET_ALCHEMY_KEY}`,
  networkName: 'homestead',
  alchemyKey: MAINNET_ALCHEMY_KEY,
} as Config;

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.

// TODO network config should be set by the provider
const config: Config = {
  ...MAINNET_ALCHEMY_CONFIG,
  tempusPools: [
    {
      address: '0x6320E6844EEEa57343d5Ca47D3166822Ec78b116',
      poolId: '0x7004797ad44897f90401609c075e2f082be9d8be000200000000000000000000',
      ammAddress: '0x7004797ad44897f90401609C075E2F082be9D8Be',
      principalsAddress: '0x5A5cBa78Ae5ebd7142D0B8C796565388BA4B5732',
      yieldsAddress: '0x1f436309fBfB405192Acdc80d5C284De45e520EB',
      yieldBearingTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      backingTokenAddress: '0x0000000000000000000000000000000000000000',
      startDate: 1639157275000,
      maturityDate: 1648742400000,
      protocol: 'lido',
      backingToken: 'ETH',
      yieldBearingToken: 'stETH',
      spotPrice: '1',
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
      poolId: '0x200e41be620928351f98da8031baeb7bd401a129000200000000000000000001',
      ammAddress: '0x200e41BE620928351F98Da8031BAEB7BD401a129',
      principalsAddress: '0x2C4AC125044e853F0f6d66b95365CBBa204fFCFD',
      yieldsAddress: '0xfFaCF0b02851e440FA207Ea2f9AfDF7FfE0bE095',
      yieldBearingTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      backingTokenAddress: '0x0000000000000000000000000000000000000000',
      startDate: 1639158404000,
      maturityDate: 1661875200000,
      protocol: 'lido',
      backingToken: 'ETH',
      yieldBearingToken: 'stETH',
      spotPrice: '1',
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
      address: '0xdA2F58e721a96ea46dbf670E54B8D944Bfc2C3d1',
      poolId: '0x4eff5f6f137d0ed52d9089c303f91ba8c1f46422000200000000000000000002',
      ammAddress: '0x4Eff5f6F137d0Ed52d9089C303f91BA8c1F46422',
      principalsAddress: '0x3A00236B6267bbE65B2F742221b4c4ebd634D997',
      yieldsAddress: '0xdbb57dF9Fe2050EbA30dD9443CE5aA4c9cc05B8F',
      yieldBearingTokenAddress: '0x016bf078ABcaCB987f0589a6d3BEAdD4316922B0',
      backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      startDate: 1642168407000,
      maturityDate: 1656057600000,
      protocol: 'rari',
      backingToken: 'USDC',
      yieldBearingToken: 'RSPT',
      spotPrice: '1',
      decimalsForUI: 4,
      tokenPrecision: {
        backingToken: 6,
        lpTokens: 6,
        principals: 6,
        yieldBearingToken: 18,
        yields: 6,
      },
    },
  ],
  statisticsContract: '0xf7247e16d6cD0A64d0C210f150fD356AcF26E89C',
  tempusControllerContract: '0xdB5fD0678eED82246b599da6BC36B56157E4beD8',
  vaultContract: '0x6f419298Ad53f82BA8dFFa9B34F9C7888b43BB13',
  lidoOracle: '0x442af784a788a5bd6f42a01ebe9f287a871243fb',
};

export default config;
