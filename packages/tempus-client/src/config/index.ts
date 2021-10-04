import { Config } from '../interfaces';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tempusPools: [
    {
      address: '0x9edfCD33FEc28994289A5EC09C923E281F6D80C8',
      ammAddress: '0x52e35951D49ff6B09E7ADD4ff8036Fec6340BC1b',
      backingToken: 'ETH',
      spotPrice: '2',
      maxLeftoverShares: '0.00001',
    },
    {
      address: '0x8A326f00944972F4a218Cc6062D62f093D0490a7',
      ammAddress: '0x56643fe046eb8BFbE8D651501c4176D5CE7A3dcB',
      backingToken: 'ETH',
      spotPrice: '2',
      maxLeftoverShares: '0.00001',
    },
  ],
  statisticsContract: '0xD827934B65835F600aC4E22aeD9119b15C9AA93E',
  tempusControllerContract: '0xFb2D2c4cF43468619A6df3f2f413bc777CA62091',
  vaultContract: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  networkUrl: 'https://eth-goerli.alchemyapi.io/v2/RUE8LXWaELu4_nyMgfK99eX3DWoxLtDw',
  networkName: 'goerli',
  alchemyKey: 'RUE8LXWaELu4_nyMgfK99eX3DWoxLtDw',
};

export default config;
