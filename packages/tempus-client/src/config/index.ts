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
    { name: 'aave', address: '0x93FF98eC53FD4c69324d3d1c6F48E53fa97e2fF3' }, // TBD - ideally we will be able to fetch list of pools from contract
    { name: 'aave', address: '0xEA9E6552Afdc38859403Acb262de7D14cfA0536d' }, // TBD - ideally we will be able to fetch list of pools from contract
  ],
  tokenNameToIdMap: {
    AaveAToken: 'aave',
  },
};

export default config;
