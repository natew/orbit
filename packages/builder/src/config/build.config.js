//

// WARNING WARNING
// TURN OFF PRETTIER ON THIS FILE IT DESTROYS THE REGEX
// WARNING

const Path = require('path')
// const Fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const getClientEnvironment = require('./env')
const paths = require('./paths')
const publicPath = '/'
const publicUrl = ''
const env = getClientEnvironment(publicUrl)
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const ROOT = Path.join(__dirname, '..')
const IS_PROD = process.env.NODE_ENV === 'production'
const IS_DEV = !IS_PROD
const filtered = ls => ls.filter(x => !!x)

// if you want to parse our modules directly use this, but we have dist/ folder now
// const ORG = Path.resolve(__dirname, '..', '..', 'node_modules', '@mcro')
// const includes = Fs.readdirSync(ORG).map(folder => Path.resolve(ORG, folder))

console.log('running webpack for:', process.env.NODE_ENV)
console.log(env.stringified)

let config

if (IS_PROD) {
  config = {
    devtool: 'source-map',
    // bail: true,
  }
} else {
  config = {
    devtool: 'cheap-module-source-map',
  }
}

module.exports = Object.assign(config, {
  entry: {
    app: filtered([
      IS_DEV && require.resolve('webpack-dev-server/client') + '?/',
      IS_DEV && require.resolve('webpack/hot/only-dev-server'),
      paths.appIndexJs,
    ]),
  },

  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'js/[name].js',
    publicPath: publicPath,
  },

  resolve: {
    // avoid module field so we pick up our prod build stuff
    // NOTE: 'es5'
    mainFields: IS_DEV
      ? ['module', 'browser', 'main', 'es5']
      : ['browser', 'module:production', 'module', 'main', 'es5'],
    extensions: ['.js', '.json'],
    // WARNING: messing with this order is dangerous af
    // TODO: can add root monorepo node_modules and then remove a lot of babel shit
    modules: [paths.modelsNodeModules, paths.appNodeModules, 'node_modules'],
    // since were forced into full lodash anyway, lets dedupe
    alias: {
      'lodash.merge': 'lodash/merge',
      'lodash.isequal': 'lodash/isEqualWith',
      'lodash.bind': 'lodash/bind',
      'lodash.some': 'lodash/some',
      'lodash.map': 'lodash/map',
      'lodash.reduce': 'lodash/reduce',
      'lodash.reject': 'lodash/reject',
      'lodash.foreach': 'lodash/forEach',
      'lodash.filter': 'lodash/filter',
      'lodash.flatten': 'lodash/flatten',
      'lodash.pick': 'lodash/pick',
    },
  },

  module: {
    rules: [
      {
        use: {
          loader: 'babel-loader',
        },
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },

  plugins: filtered([
    new InterpolateHtmlPlugin(env.raw),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    //
    // 🚨
    // warning: disabling this fixed styles not attaching:
    // new webpack.DefinePlugin(env.stringified),
    // ⏰
    //
    new CaseSensitivePathsPlugin(),
    // hmr
    IS_DEV && new webpack.HotModuleReplacementPlugin(),
    IS_DEV && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // readable names
    new webpack.NamedModulesPlugin(),

    // production
    IS_PROD &&
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks(module) {
          var context = module.context
          return context && context.indexOf('node_modules') >= 0
        },
      }),
    // IS_PROD && new webpack.optimize.OccurrenceOrderPlugin(),
    IS_PROD &&
      new BabelMinifyPlugin({
        deadcode: true,
        mangle: { topLevel: true },
      }),

    // bundle analyzer
    process.env.DEBUG && new BundleAnalyzerPlugin(),
  ]),
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
})