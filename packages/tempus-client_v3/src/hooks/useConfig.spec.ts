import { renderHook } from '@testing-library/react-hooks';
import { getConfigManager } from '../config/getConfigManager';
import { mockConfig } from '../setupTests';
import { useConfig } from './useConfig';

jest.setTimeout(10000);

describe('useConfig', () => {
  beforeAll(async () => {
    jest.resetAllMocks();

    const config = getConfigManager();
    await config.init();
  });

  it('returns config when it is fetched', async () => {
    const { result } = renderHook(() => useConfig());

    expect(mockConfig).toStrictEqual(result.current);
  });
});
