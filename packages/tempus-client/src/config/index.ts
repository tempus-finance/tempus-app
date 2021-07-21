import { Config } from '../interfaces';

const config: Config = {
  tokens: [
    { ticker: 'aave', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
    { ticker: 'comp', address: '0xc00e94cb662c3520282e6f5717214004a7f26888' },
    { ticker: 'dai', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
    { ticker: 'eth', address: '' }, // TBD
    { ticker: 'tusd', address: '0x0000000000085d4780B73119b644AE5ecd22b376' },
    { ticker: 'usdc', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  ],
  protocols: [
    { name: 'aave', address: '' }, // TBD
    { name: 'compound', address: '' }, // TBD
    { name: 'lido', address: '' }, // TBD
  ],
};

export default config;
