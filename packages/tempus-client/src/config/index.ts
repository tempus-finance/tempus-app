import { Config } from '../interfaces';

// Ideally we should have only one contract address here (factory contract) that we can query to get additional contract addresses.
// Waiting for backend team for factory contract - for now, we need to store all relevant contract addresses in this config.
const config: Config = {
  tokens: [
    { ticker: 'aave', address: '' },
    { ticker: 'comp', address: '' },
    { ticker: 'dai', address: '' },
    { ticker: 'eth', address: '' }, // TBD
    { ticker: 'tusd', address: '' },
    { ticker: 'usdc', address: '' },
  ],
  protocols: [
    { name: 'aave', address: '' }, // TBD
    { name: 'compound', address: '' }, // TBD
    { name: 'lido', address: '' }, // TBD
  ],
  tempusPools: [
    {
      address: '0x2B2a0994Faca1d245f51720c4E2517869FbF002A',
      backingToken: 'dai',
    },
  ],
  priceOracles: [],
  statisticsContract: '',
  networkUrl: '',
};

export default config;
