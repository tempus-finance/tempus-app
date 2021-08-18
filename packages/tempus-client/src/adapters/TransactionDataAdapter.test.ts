import TransactionsDataAdapter from './TransactionsDataAdapter';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

// Adding any here so that I can mock private functions - there doesn't seem to by any other way to do so.
let instance: any;
let spyFetchEvents: any;
let spyFetchTransactionData: any;
let mockProvider = new JsonRpcProvider();

describe('generateData()', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Contract.mockImplementation(() => {
      return {};
    });

    instance = new TransactionsDataAdapter();
    spyFetchEvents = jest.spyOn(instance, 'fetchEvents').mockImplementation(() => {});
    spyFetchTransactionData = jest.spyOn(instance, 'fetchTransactionData').mockImplementation(() => {
      return [
        {
          transaction: 'test-transaction',
        },
      ];
    });

    instance.init(mockProvider);
  });

  test('it returns an array of transactions', async () => {
    const transactions = await instance.generateData();

    expect(spyFetchEvents).toHaveBeenCalledTimes(1);
    expect(spyFetchTransactionData).toHaveBeenCalledTimes(1);

    expect(transactions.length).toBe(1);
    expect(transactions[0].transaction).toBe('test-transaction');
  });
});
