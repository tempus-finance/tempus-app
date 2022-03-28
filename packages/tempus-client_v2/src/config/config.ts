import { Config } from '../interfaces/Config';

const ETHEREUM_MAINNET_ALCHEMY_KEY = process.env.REACT_APP_MAINNET_ALCHEMY_KEY || '';
const FANTOM_MAINNET_RPC_ENDPOINT = process.env.REACT_APP_FANTOM_ENDPOINT || '';
const REACT_APP_ETHEREUM_FORK_RPC = process.env.REACT_APP_ETHEREUM_FORK_RPC || '';

const config: Config = {
  ethereum: {
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
        protocolDisplayName: 'Lido',
        backingToken: 'ETH',
        yieldBearingToken: 'stETH',
        spotPrice: '1',
        decimalsForUI: 4,
        showEstimatesInBackingToken: false,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
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
        protocolDisplayName: 'Lido',
        backingToken: 'ETH',
        yieldBearingToken: 'stETH',
        spotPrice: '1',
        decimalsForUI: 4,
        showEstimatesInBackingToken: false,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
      {
        address: '0xc58b8DD0075f7ae7B1CF54a56F899D8b25a7712E',
        poolId: '0x30002861577da4ea6aa23966964172ad75dca9c7000200000000000000000003',
        ammAddress: '0x30002861577Da4EA6aA23966964172Ad75DCa9C7',
        principalsAddress: '0xBaF9434C102000F3f80BBE3c4b89018fAc43EB76',
        yieldsAddress: '0x2a7b99156256Bd6A75B92D5073C53C0ee574a9f6',
        yieldBearingTokenAddress: '0x016bf078ABcaCB987f0589a6d3BEAdD4316922B0',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        startDate: 1642505820000,
        maturityDate: 1656057600000,
        protocol: 'rari',
        protocolDisplayName: 'Rari Capital',
        backingToken: 'USDC',
        yieldBearingToken: 'RSPT',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 6,
          lpTokens: 18,
          principals: 6,
          yieldBearingToken: 18,
          yields: 6,
        },
        disabledOperations: {
          deposit: true,
          mint: true,
        },
      },
      {
        address: '0x443297DE16C074fDeE19d2C9eCF40fdE2f5F62C2',
        poolId: '0x811f4f0241a9a4583c052c08bda7f6339dbb13f7000200000000000000000006',
        ammAddress: '0x811f4F0241A9A4583C052c08BDA7F6339DBb13f7',
        principalsAddress: '0xB3EC7FACb30b163b1375285EA7EbfEeFc41920B9',
        yieldsAddress: '0x7A00E04EAA42DCa96ED63a2b4Ae8461773b4ce6C',
        yieldBearingTokenAddress: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        startDate: 1648197339000,
        maturityDate: 1664524800000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'USDC',
        yieldBearingToken: 'yvUSDC',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 6,
          lpTokens: 18,
          principals: 6,
          yieldBearingToken: 6,
          yields: 6,
        },
        disabledOperations: {},
      },
      {
        address: '0x7e0fc07280f47bac3D55815954e0f904c86f642E',
        poolId: '0x7ca043143c6e30bda28ddc7322d7951f538d75e8000200000000000000000005',
        ammAddress: '0x7cA043143C6e30bDA28dDc7322d7951F538D75e8',
        principalsAddress: '0xfE932d00b9858C42108378053C11bE79656116AF',
        yieldsAddress: '0x1baB1bF8FfFC5cd80E2D0B597e0a96e2043b1157',
        yieldBearingTokenAddress: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
        backingTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        startDate: 1648197020000,
        maturityDate: 1672387200000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'DAI',
        yieldBearingToken: 'yvDAI',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
    ],
    statisticsContract: '0xe552369a1b109b1eeebf060fcb6618f70f9131f7',
    tempusControllerContract: '0xdB5fD0678eED82246b599da6BC36B56157E4beD8',
    vaultContract: '0x6f419298Ad53f82BA8dFFa9B34F9C7888b43BB13',
    lidoOracle: '0x442af784a788a5bd6f42a01ebe9f287a871243fb',
    publicNetworkUrl: '', // Ethereum mainnet does not have public RPC URL
    privateNetworkUrl: `https://eth-mainnet.alchemyapi.io/v2/${ETHEREUM_MAINNET_ALCHEMY_KEY}`,
    networkName: 'homestead',
    alchemyKey: ETHEREUM_MAINNET_ALCHEMY_KEY,
    chainId: 1,
    averageBlockTime: 13.2,
    nativeToken: 'ETH',
    nativeTokenPrecision: 18,
    blockExplorerName: 'Etherscan',
    blockExplorerUrl: 'https://etherscan.io/',
  },
  fantom: {
    tempusPools: [
      {
        address: '0x943B73d3B7373de3e5Dd68f64dbf85E6F4f56c9E',
        poolId: '0x8dcf7e47d7c285e11e48a78dfddaec5c48887af8000200000000000000000000',
        ammAddress: '0x8DCf7e47d7c285e11E48a78dFDDaEc5c48887AF8',
        principalsAddress: '0x9aD9b6B9dE45B5Cc4Fd421b2CeD84eFAbF2A7fD5',
        yieldsAddress: '0x780d7588f260E31DFE9c352fA4eC0690FcD1C807',
        yieldBearingTokenAddress: '0xEF0210eB96c7EB36AF8ed1c20306462764935607',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        startDate: 1644432845000,
        maturityDate: 1661500800000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'USDC',
        yieldBearingToken: 'yvUSDC',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 6,
          lpTokens: 18,
          principals: 6,
          yieldBearingToken: 6,
          yields: 6,
        },
        disabledOperations: {},
      },
      {
        address: '0x9c0273E4abB665ce156422a75F5a81db3c264A23',
        poolId: '0x354090dd4f695d7dc5ad492e48d0f30042ed7bbe000200000000000000000001',
        ammAddress: '0x354090dd4f695D7dc5ad492e48d0f30042Ed7BbE',
        principalsAddress: '0xe16bCEd5425AeC6BD5499865512F55efd6a06366',
        yieldsAddress: '0xb797C9D462a336b9d25F23Fe50C2B33A38B5792a',
        yieldBearingTokenAddress: '0x637eC617c86D24E421328e6CAEa1d92114892439',
        backingTokenAddress: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
        startDate: 1644437001000,
        maturityDate: 1656057600000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'DAI',
        yieldBearingToken: 'yvDAI',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
      {
        address: '0xE9b557f9766Fb20651E3685374cd1DF6f977d36B',
        poolId: '0x54b28166026e8dd13bf07c46da6ef754a6b80989000200000000000000000002',
        ammAddress: '0x54b28166026e8dd13bf07c46da6ef754a6b80989',
        principalsAddress: '0x73F5E4465946D03045CdC78d6028b53A0745baBb',
        yieldsAddress: '0x9f6F78F2e1819C612A4AB98D73B75F2aFA9Ce3AD',
        yieldBearingTokenAddress: '0x148c05caf1Bb09B5670f00D511718f733C54bC4c',
        backingTokenAddress: '0x049d68029688eabf473097a2fc38ef61633a3c7a',
        startDate: 1644440954000,
        maturityDate: 1659081600000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'USDT',
        yieldBearingToken: 'yvUSDT',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 6,
          lpTokens: 18,
          principals: 6,
          yieldBearingToken: 6,
          yields: 6,
        },
        disabledOperations: {},
      },
      // POOL DISABLED
      // {
      //   address: '0x098cf68D4Fc00889bE9Ee2E11b98f8f3B22EAcF1',
      //   poolId: '0x3f25b7ed5adc081ff0a4a42c6638f2128ffe82df000200000000000000000003',
      //   ammAddress: '0x3F25B7ed5aDC081fF0A4A42C6638f2128fFE82Df',
      //   principalsAddress: '0x006214B0e67FFe15ecC486D9790b24573E4E6819',
      //   yieldsAddress: '0x8584Be580d183E02084d5a692c9430745Fff7f24',
      //   yieldBearingTokenAddress: '0xd817A100AB8A29fE3DBd925c2EB489D67F758DA9',
      //   backingTokenAddress: '0x321162cd933e2be498cd2267a90534a804051b11',
      //   startDate: 1644473410000,
      //   maturityDate: 1653638400000,
      //   protocol: 'yearn',
      //   protocolDisplayName: 'Yearn',
      //   backingToken: 'WBTC',
      //   yieldBearingToken: 'yvWBTC',
      //   spotPrice: '0.002',
      //   decimalsForUI: 4,
      //   showEstimatesInBackingToken: true,
      //   tokenPrecision: {
      //     backingToken: 8,
      //     lpTokens: 18,
      //     principals: 8,
      //     yieldBearingToken: 8,
      //     yields: 8,
      //   },
      //   disabledOperations: {},
      // },
      {
        address: '0xA9C549aeFa21ee6e79bEFCe91fa0E16a9C7d585a',
        poolId: '0x51b21368396cb76a348e995d698960f8fe44def1000200000000000000000004',
        ammAddress: '0x51B21368396cb76A348E995D698960F8fe44DeF1',
        principalsAddress: '0xda64a2343AAb13350D1f2761b2AdC06ee8cC6cbC',
        yieldsAddress: '0x074fC92d15B1EcdBe04DD196b10933f0Fb000f8d',
        yieldBearingTokenAddress: '0xCe2Fc0bDc18BD6a4d9A725791A3DEe33F3a23BB7',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        startDate: 1644474021000,
        maturityDate: 1656057600000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'WETH',
        yieldBearingToken: 'yvWETH',
        spotPrice: '0.0002',
        decimalsForUI: 4,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
      {
        address: '0xAE7E5242eb52e8a592605eE408268091cC8794b8',
        poolId: '0x4b137dd01a7dc7c3bc12d51b42a00030b6561340000200000000000000000005',
        ammAddress: '0x4B137DD01a7Dc7c3Bc12d51b42a00030B6561340',
        principalsAddress: '0x2810AD0642BA85e09C722F2eb8203C00e8E6D199',
        yieldsAddress: '0xD2De74a2a0026A6c020c291861956b1959F663A0',
        yieldBearingTokenAddress: '0x2C850cceD00ce2b14AA9D658b7Cad5dF659493Db',
        backingTokenAddress: '0x29b0Da86e484E1C0029B56e817912d778aC0EC69',
        startDate: 1644474351000,
        maturityDate: 1653638400000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'YFI',
        yieldBearingToken: 'yvYFI',
        spotPrice: '0.00004',
        decimalsForUI: 4,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
    ],
    statisticsContract: '0x7008d1f94088c8AA012B4F370A4fe672ad592Ee3',
    tempusControllerContract: '0x8c47924b35C3667F59Df579F3ec061F8d7603242',
    vaultContract: '0xfCD78cA49368D3E5A93171335d2f31705d00Ca38',
    lidoOracle: '', // We need to set if we want to add Lido pools for Fantom chain
    publicNetworkUrl: `https://rpc.ftm.tools/`,
    privateNetworkUrl: FANTOM_MAINNET_RPC_ENDPOINT,
    networkName: 'fantom-mainnet',
    alchemyKey: '', // We don't need alchemy for Fantom chain
    chainId: 250,
    averageBlockTime: 0.9,
    nativeToken: 'FTM',
    nativeTokenPrecision: 18,
    blockExplorerName: 'FTMScan',
    blockExplorerUrl: 'https://ftmscan.com/',
  },
  'ethereum-fork': {
    tempusPools: [
      {
        address: '0x2B2a0994Faca1d245f51720c4E2517869FbF002A',
        poolId: '0x1a367457ffd7046cb03e5e8409b65a6a754b2fc1000200000000000000000005',
        ammAddress: '0x1a367457FfD7046Cb03e5E8409b65A6A754B2Fc1',
        principalsAddress: '0xdA437583dd0D22FA713d86291461858d2b3161C8',
        yieldsAddress: '0xd735aed2FfaE008D36eD8fe9c680EaA9A4861dCc',
        yieldBearingTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        startDate: 1648112421000,
        maturityDate: 1648116087000,
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        backingToken: 'ETH',
        yieldBearingToken: 'stETH',
        spotPrice: '1',
        decimalsForUI: 4,
        showEstimatesInBackingToken: false,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
      {
        address: '0xbec9460C422467D58299002078540e366C7F8938',
        poolId: '0x5ddcd1c60896581c710b37827c72ea424d302fb1000200000000000000000006',
        ammAddress: '0x5DDCd1C60896581c710B37827C72eA424D302FB1',
        principalsAddress: '0xD71F1E6b44A2054915CC1725165484d2BE94F255',
        yieldsAddress: '0x91c2A6Df939592DB28e7DB136C10e7B5f95a2702',
        yieldBearingTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        startDate: 1648153435000,
        maturityDate: 1648758305000,
        protocol: 'lido',
        protocolDisplayName: 'Lido',
        backingToken: 'ETH',
        yieldBearingToken: 'stETH',
        spotPrice: '1',
        decimalsForUI: 4,
        showEstimatesInBackingToken: false,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
      {
        address: '0x05f08a0E8DF6B3FDbc4af0f0fd066fb3cB4B285e',
        poolId: '0xa3904b472b682ca2d8a3d3e8fe6fd21f7e9018c9000200000000000000000007',
        ammAddress: '0xA3904b472B682ca2d8A3D3e8fE6fD21F7e9018c9',
        principalsAddress: '0x55D0A495bdca5C5f8AF92ef342D27a63a95Cdee2',
        yieldsAddress: '0x2d8E2FA2A7C1f232d1E80Dd8C40F05524b476851',
        yieldBearingTokenAddress: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
        backingTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        startDate: 1648200358000,
        maturityDate: 1648459625000,
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        backingToken: 'DAI',
        yieldBearingToken: 'yvDAI',
        spotPrice: '1',
        decimalsForUI: 2,
        showEstimatesInBackingToken: true,
        tokenPrecision: {
          backingToken: 18,
          lpTokens: 18,
          principals: 18,
          yieldBearingToken: 18,
          yields: 18,
        },
        disabledOperations: {},
      },
    ],
    statisticsContract: '0xe552369a1b109b1eeebf060fcb6618f70f9131f7',
    tempusControllerContract: '0x039557b8f8f53d863f534C4dFF01d8A3467d26A0',
    vaultContract: '0x6f419298Ad53f82BA8dFFa9B34F9C7888b43BB13',
    lidoOracle: '0x442af784a788a5bd6f42a01ebe9f287a871243fb',
    publicNetworkUrl: '', // Ethereum mainnet does not have public RPC URL
    privateNetworkUrl: REACT_APP_ETHEREUM_FORK_RPC,
    networkName: 'tempus-ethereum-fork',
    alchemyKey: ETHEREUM_MAINNET_ALCHEMY_KEY,
    chainId: 31337,
    averageBlockTime: 13.2,
    nativeToken: 'ETH',
    nativeTokenPrecision: 18,
    blockExplorerName: 'Etherscan',
    blockExplorerUrl: 'https://etherscan.io/',
  },
};

export default config;
