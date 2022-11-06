const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/js/index.js',
  devServer: {
    static: './client',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client'),
  },
  devtool: 'source-map',
};