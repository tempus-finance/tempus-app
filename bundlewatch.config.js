const bundlewatchConfig = {
  files: [
    {
      path: 'packages/tempus-client_v2/build/static/js/*.js',
    },
  ],
  normalizeFilenames: /^.+?(\..+?)\.\w+$/,
};
module.exports = bundlewatchConfig;
