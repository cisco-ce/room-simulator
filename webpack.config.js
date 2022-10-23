const path = require('path');

module.exports = {
  entry: './client/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client'),
  },
  devtool: 'source-map',
};