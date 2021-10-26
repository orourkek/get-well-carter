const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    // open: true,
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.join(__dirname, 'src'),
        loaders: [ 'ts-loader' ],
      },
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loaders: [ 'babel-loader' ],
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml|mp3|wav)$/i,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ]
};
