const bundlewatchConfig = {
  files: [
    {
      path: './packages/tempus-client_v2/build/static/js/*.chunk.js',
    },
  ],
  normalizeFilenames: /^.+?(\..+?)\.\w+$/,
};
module.exports = bundlewatchConfig;
