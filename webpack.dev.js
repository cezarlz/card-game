const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: {
    'main': path.join(__dirname, 'app/assets/js/main.js')
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'assets/js/[name].js'
  },
  devServer: {
    inline: true,
    progress: true,
    colors: true,
    open: true,
    contentBase: path.join(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: '*.html'
      }
    ])
  ]
};
