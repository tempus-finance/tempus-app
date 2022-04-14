/**
 * Returns a promise that resolves after specified amount of time.
 * @param value Amount of time to wait in ms.
 */
export function wait(value: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, value);
  });
}
