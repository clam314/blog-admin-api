const path = require('path')

const utils = require('./utils')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const env = process.env.NODE_ENV

const webpackconfig = {
  target: 'node',
  entry: {
    server: path.join(utils.APP_PATH, 'index.js')
  },
  resolve: {
    ...utils.getWebpackResolveConfig()
  },
  output: {
    filename: '[name].bundle.js',
    path: utils.DIST_PATH
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: [path.join(__dirname, '/node_modules')]
      }
    ]
  },
  externals: [nodeExternals()],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new Dotenv({
      path: env !== 'development' ? './.env' : './.env.development'
    })
  ],
  node: {
    global: true,
    __filename: true,
    __dirname: true
  }
}

module.exports = webpackconfig
