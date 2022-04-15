module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/preset-create-react-app',
  ],
  framework: '@storybook/react',
  webpackFinal: async (config, { configType }) => {
    config.performance.maxAssetSize = 1024 * 1024 * 5; //5 MB
    config.performance.maxEntrypointSize = 1024 * 1024 * 5; //5 MB

    return config;
  },
};
