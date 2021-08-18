import { Config } from '../interfaces';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tokens: [
    { ticker: 'AAVE', address: '' },
    { ticker: 'COMP', address: '' },
    { ticker: 'DAI', address: '' },
    { ticker: 'ETH', address: '' }, // TBD
    { ticker: 'TUSD', address: '' },
    { ticker: 'USDC', address: '' },
  ],
  protocols: [
    { name: 'aave', address: '' }, // TBD
    { name: 'compound', address: '' }, // TBD
    { name: 'lido', address: '' }, // TBD
  ],
  tempusPools: [
    {
      address: '',
      backingToken: '',
    },
  ],
  priceOracles: [],
  statisticsContract: '',
  networkUrl: '',
};

export default config;
