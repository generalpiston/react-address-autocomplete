var webpack = require('webpack'),
    Path = require('path');

module.exports = {
  entry: './examples/basic.js',
  output: {
    filename: 'basic.js',
    path: Path.join(__dirname, 'docs', 'examples')
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
