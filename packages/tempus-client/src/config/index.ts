import { Config } from '../interfaces';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tempusPools: [
    {
      address: '',
      ammAddress: '',
      backingToken: 'DAI',
      spotPrice: '10000',
      maxLeftoverShares: '',
    },
  ],
  statisticsContract: '',
  tempusControllerContract: '',
  vaultContract: '',
  networkUrl: '',
};

export default config;
