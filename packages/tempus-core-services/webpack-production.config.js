const path = require('path');
const webpack = require('webpack');

require('dotenv').config({ path: './.env.production' });

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: 'index.js',
    library: 'tempus-core-services',
    libraryTarget: 'umd',
  },
  mode: 'production',
  devtool: 'eval-source-map',
  externals: ['ethers', 'rxjs', 'date-fns', '@ethersproject/providers'],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
};
