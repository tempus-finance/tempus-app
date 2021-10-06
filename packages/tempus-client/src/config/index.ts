import { Config } from '../interfaces';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tempusPools: [
    {
      address: '0x1c5AbE736C6CCb743Bc933241AB462e6b38c6EA4',
      ammAddress: '0xFb2dF41A618b44634a4E180248fAAA4dc755d84a',
      backingToken: 'ETH',
      spotPrice: '2',
      maxLeftoverShares: '0.00001',
      decimalsForUI: 4,
    },
    {
      address: '0x0749982cAD68506009C7f0341a9A7fD6107A40C2',
      ammAddress: '0x1814562E59c704E8BC57D2d76e4eEc2bD8a694f3',
      backingToken: 'ETH',
      spotPrice: '2',
      maxLeftoverShares: '0.00001',
      decimalsForUI: 4,
    },
  ],
  statisticsContract: '0x01fF82791D8414826ec7390dfE7902703F632F5C',
  tempusControllerContract: '0xd4330638b87f97Ec1605D7EC7d67EA1de5Dd7aaA',
  vaultContract: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  networkUrl: 'https://eth-goerli.alchemyapi.io/v2/RUE8LXWaELu4_nyMgfK99eX3DWoxLtDw',
  networkName: 'goerli',
  alchemyKey: 'RUE8LXWaELu4_nyMgfK99eX3DWoxLtDw',
  lidoOracle: '0x24d8451BC07e7aF4Ba94F69aCDD9ad3c6579D9FB',
};

export default config;
