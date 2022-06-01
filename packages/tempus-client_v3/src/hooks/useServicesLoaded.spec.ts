import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { useServicesLoaded } from './useServicesLoaded';

describe('useServicesLoaded', () => {
  it('sets default value to false', () => {
    const { result } = renderHook(() => useServicesLoaded());

    const [servicesLoaded] = result.current;

    expect(servicesLoaded).toBeFalsy();
  });

  it('properly sets state for servicesLoaded', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useServicesLoaded());

    const [servicesLoaded, setServicesLoaded] = result.current;

    // Default value
    expect(servicesLoaded).toBeFalsy();

    await act(async () => {
      setServicesLoaded(true);
      await waitForNextUpdate();
    });

    const [servicesLoadedAfterUpdate] = result.current;

    expect(servicesLoadedAfterUpdate).toBeTruthy();
  });
});
