const bundlewatchConfig = {
  files: [
    {
      path: 'packages/tempus-client_v2/build/*.js',
      maxSize: '100kB',
    },
  ],
};
module.exports = bundlewatchConfig;
