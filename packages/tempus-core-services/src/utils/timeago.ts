export const timeago = (timestamp: number): string => {
  const now = Date.now();
  let diff = now - timestamp;

  if (diff < 60 * 1000) {
    return `${Math.floor(diff / 1000)}s`;
  }

  diff = Math.floor(diff / (60 * 1000));
  if (diff < 60) {
    return `${diff}m`;
  }

  diff = Math.floor(diff / 60);
  if (diff < 24) {
    return `${diff}h`;
  }

  diff = Math.floor(diff / 24);
  if (diff < 7) {
    return `${diff}d`;
  } else if (diff < 365) {
    return `${Math.floor(diff / 7)}w`;
  } else {
    return `${Math.floor(diff / 365)}y`;
  }
};
