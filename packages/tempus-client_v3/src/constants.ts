export const POLLING_INTERVAL_IN_MS = 2 * 60 * 1000;
export const DEBOUNCE_IN_MS = 500;
export const TIMEOUT_FROM_SUCCESS_TO_DEFAULT_IN_MS = 3000;

export const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'short',
});
