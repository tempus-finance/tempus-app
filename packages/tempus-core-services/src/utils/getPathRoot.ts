export function getPathRoot(path: string): string {
  if (path === '/') {
    return '';
  }

  let relativePath = '';
  if (path.startsWith('/')) {
    relativePath = path.substring(1);
  } else {
    relativePath = path;
  }

  const firstSeparatorIndex = relativePath.indexOf('/');
  if (!firstSeparatorIndex) {
    return '';
  }

  return relativePath.slice(0, firstSeparatorIndex);
}
