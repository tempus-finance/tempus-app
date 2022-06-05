import { wait } from './wait';

describe('wait', () => {
  it('should call setTimeout', () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout').mockImplementation();

    wait(1234);

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1234);

    jest.useRealTimers();
  });
});
