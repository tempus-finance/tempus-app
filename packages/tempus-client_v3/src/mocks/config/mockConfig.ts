export const pool1 = {
  address: '1',
  poolId: 'ethereum-1',
  backingToken: 'ETH',
  backingTokenAddress: '0x0000000000000000000000000000000000000000',
  yieldBearingToken: 'stETH',
  yieldBearingTokenAddress: '00001-ybt',
  principalsAddress: '00001-p',
  yieldsAddress: '00001-y',
  ammAddress: '00001-amm',
  chain: 'ethereum',
  protocol: 'lido',
  protocolDisplayName: 'Lido',
  spotPrice: '1',
  decimalsForUI: 4,
  startDate: 1640995200000, // 2022/01/01
  maturityDate: 1735689600000, // 2025/01/01
  tokenPrecision: {
    backingToken: 18,
    yieldBearingToken: 18,
  },
};

export const pool2 = {
  address: '2',
  poolId: 'ethereum-2',
  backingToken: 'USDC',
  backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  yieldBearingToken: 'yvUSDC',
  yieldBearingTokenAddress: '00002-ybt',
  principalsAddress: '00002-p',
  yieldsAddress: '00002-y',
  ammAddress: '00002-amm',
  chain: 'ethereum',
  protocol: 'yearn',
  protocolDisplayName: 'Yearn',
  spotPrice: '1',
  decimalsForUI: 4,
  startDate: 1643673600000, // 2022/02/01
  maturityDate: 1709251200000, // 2024/03/01
  tokenPrecision: {
    backingToken: 6,
    yieldBearingToken: 6,
  },
};

export const pool3 = {
  address: '3',
  poolId: 'fantom-1',
  backingToken: 'USDC',
  backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
  yieldBearingToken: 'yvUSDC',
  yieldBearingTokenAddress: '00003-ybt',
  principalsAddress: '00003-p',
  yieldsAddress: '00003-y',
  ammAddress: '00003-amm',
  chain: 'fantom',
  protocol: 'yearn',
  protocolDisplayName: 'Yearn',
  spotPrice: '1',
  decimalsForUI: 2,
  startDate: 1642204800000, // 2022/15/01
  maturityDate: 1743724800000, // 2025/04/04
  tokenPrecision: {
    backingToken: 6,
    yieldBearingToken: 6,
  },
};

export const pool4 = {
  address: '4',
  poolId: 'fantom-2',
  backingToken: 'WETH',
  backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
  yieldBearingToken: 'yvWETH',
  yieldBearingTokenAddress: '00004-ybt',
  principalsAddress: '00004-p',
  yieldsAddress: '00004-y',
  ammAddress: '00004-amm',
  chain: 'fantom',
  protocol: 'yearn',
  protocolDisplayName: 'Yearn',
  spotPrice: '1',
  decimalsForUI: 4,
  startDate: 1647216000000, // 2022/03/14
  maturityDate: 1671062400000, // 2022/12/15
  tokenPrecision: {
    backingToken: 18,
    yieldBearingToken: 18,
  },
};

export const pool5 = {
  address: '5',
  poolId: 'fantom-3',
  backingToken: 'WETH',
  backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
  yieldBearingToken: 'yvWETH',
  yieldBearingTokenAddress: '00004-ybt',
  principalsAddress: '00004-p',
  yieldsAddress: '00004-y',
  ammAddress: '00004-amm',
  chain: 'fantom',
  protocol: 'yearn',
  protocolDisplayName: 'Yearn',
  spotPrice: '1',
  decimalsForUI: 4,
  startDate: 1647216000000, // 2022/03/14
  maturityDate: 1676419200000, // 2023/2/15
  tokenPrecision: {
    backingToken: 18,
    yieldBearingToken: 18,
  },
};

export const mockConfig = {
  ethereum: {
    tempusPools: [pool1, pool2],
    chainId: 1,
    privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
    alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
  },
  fantom: {
    tempusPools: [pool3, pool4, pool5],
    chainId: 250,
    privateNetworkUrl: String(process.env.REACT_APP_FANTOM_RPC),
  },
  'ethereum-fork': {
    tempusPools: [],
    chainId: 31337,
    privateNetworkUrl: String(process.env.REACT_APP_ETHEREUM_RPC),
    alchemyKey: String(process.env.REACT_APP_MAINNET_ALCHEMY_KEY),
  },
};

jest.mock('../../config/config', () => ({
  __esModule: true,
  default: mockConfig,
}));
