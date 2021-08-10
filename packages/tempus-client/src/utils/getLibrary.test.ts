import getLibrary from './getLibrary';

jest.mock('@ethersproject/providers');
const { Web3Provider } = jest.requireMock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('utils -> getLibrary', () => {
  let mockProvider = new JsonRpcProvider();
  let mockLibrary = new Web3Provider();

  beforeEach(() => {
    Web3Provider.mockImplementation(() => mockLibrary);
  });

  describe('getLibrary()', () => {
    test('it returns a valid library instance', () => {
      const library = getLibrary(mockProvider);

      expect(library).toBeInstanceOf(Web3Provider);
    });

    test('it returns a library with poll interval set to 12 seconds', () => {
      const library = getLibrary(mockProvider);

      expect(library.pollingInterval).toBe(12000);
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
});
