import { renderHook } from '@testing-library/react-hooks';
import { of } from 'rxjs';
import { Decimal, getServices } from 'tempus-core-services';
import { useFixedApr } from './useFixedApr';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn(),
}));

const mockEstimatedDepositAndFix = jest.fn();
const mockEstimatedMintedShares = jest.fn();

describe('useFixedApr', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('returns `{}` as initial value', async () => {
    (getServices as unknown as jest.Mock).mockImplementation(() => ({
      StatisticsService: {
        estimatedDepositAndFix: mockEstimatedDepositAndFix.mockImplementation(() => of<Decimal>(new Decimal('1500'))),
        estimatedMintedShares: mockEstimatedMintedShares.mockImplementation(() => of<Decimal>(new Decimal('200'))),
      },
    }));

    const { result } = renderHook(() => useFixedApr());

    expect(result.current).toEqual({});
  });
});
