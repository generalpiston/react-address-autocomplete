var webpack = require('webpack'),
    Path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: Path.join(__dirname, 'lib'),
    library: 'AddressAutocomplete',
    libraryTarget: 'commonjs2'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.scss']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/
    }, {
      test: /\.scss$/,
      loaders: ["style", "css", "sass"],
      exclude: /node_modules/
    }]
  }
};
