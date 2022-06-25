import { getPathRoot } from './getPathRoot';

describe('getPathRoot()', () => {
  [
    { path: '/', root: '' },
    { path: '/test/path', root: 'test' },
    { path: 'test/path', root: 'test' },
    { path: '', root: '' },
    { path: 'my-path/test', root: 'my-path' },
    { path: 'test/path/abc/path', root: 'test' },
  ].forEach(item => {
    const { path, root } = item;

    test(`it returns '${root}' when path is '${path}'`, () => {
      const result = getPathRoot(path);

      expect(result).toEqual(root);
    });
  });
});
