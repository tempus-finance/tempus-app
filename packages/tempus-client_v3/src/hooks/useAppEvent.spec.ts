import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Observable } from 'rxjs';
import { TempusPool } from 'tempus-core-services';
import { pool1 } from '../setupTests';
import { useAppEvent, AppEvent } from './useAppEvent';

describe('useAppEvent', () => {
  it('check default value to be null', () => {
    const { result } = renderHook(() => useAppEvent());
    const [appEvent] = result.current;

    expect(appEvent).toBeNull();
  });

  it('receive events when emit a deposit event followed by a withdraw event', async () => {
    const mockListener = jest.fn();
    const depositEvent: AppEvent = {
      eventType: 'deposit',
      tempusPool: pool1 as TempusPool,
      txnHash: '0x0',
      timestamp: Date.now() - 2000,
    };
    const withdrawEvent: AppEvent = {
      eventType: 'withdraw',
      tempusPool: pool1 as TempusPool,
      txnHash: '0x1',
      timestamp: Date.now() - 1000,
    };
    const { appEvent$ } = require('./useAppEvent');
    (appEvent$ as Observable<AppEvent>).subscribe(mockListener);

    const { result, waitForNextUpdate } = renderHook(() => useAppEvent());
    const [appEvent, emitAppEvent] = result.current;

    expect(appEvent).toBeNull();

    await act(async () => {
      emitAppEvent(depositEvent);
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(depositEvent);

    await act(async () => {
      emitAppEvent(withdrawEvent);
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual(withdrawEvent);
    expect(mockListener).toHaveBeenNthCalledWith(1, depositEvent);
    expect(mockListener).toHaveBeenNthCalledWith(2, withdrawEvent);
  });
});
