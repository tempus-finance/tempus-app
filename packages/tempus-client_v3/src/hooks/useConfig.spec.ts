import { renderHook } from '@testing-library/react-hooks';
import { mockConfig } from '../setupTests';
import { useConfig } from './useConfig';

describe.only('useConfig', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('returns config when it is fetched', async () => {
    const { result } = renderHook(() => useConfig());

    expect(result.current).toEqual(mockConfig);
  });
});
