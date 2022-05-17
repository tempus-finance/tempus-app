import { act, renderHook } from '@testing-library/react-hooks';
import { useConfig, config$ } from './useConfig';
import { getConfigManager } from '../config/getConfigManager';

const mockConfig = {
  tempusPools: [],
};
const mockFunc = jest.fn();

describe('useConfig', () => {
  it('return empty config initially', () => {
    const { result } = renderHook(() => useConfig());
    const config = result.current;

    expect(config).toBeNull();
  });

  it("return config when it's fetched", async () => {
    jest.useFakeTimers();

    const configManager = getConfigManager();
    config$.subscribe({
      next: value => mockFunc(value),
    });
    const { result } = renderHook(() => useConfig());
    const config = result.current;

    expect(config).toBeNull();
    expect(mockFunc).not.toHaveBeenCalled();

    (configManager as any).config = mockConfig;

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current).toEqual(mockConfig);
    expect(mockFunc).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
