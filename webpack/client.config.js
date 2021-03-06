const config = require("config");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const loaders = require("./loaders");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

/*
  This forked version of the component fixes a bug that's yet to get merged into
  the original package. Here's a link to the thread:

  https://github.com/mzgoddard/hard-source-webpack-plugin/issues/416
*/
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin-fixed-hashbug");

const DEV_PORT = config.get("devServer.port");
const PROXY_HOST = config.get("devServer.proxyHost");

////////////////////////////////////////////////////////////////////////////////
// per-environment plugins
const environmentPlugins = (() => {
  switch (config.get("environment")) {
    case "development":
      return [
        // Hot reloading is set up in webpack-dev-server.js
        new HardSourceWebpackPlugin({
          cacheDirectory: path.resolve(
            __dirname,
            "../.cache/hard-source/[confighash]"
          ),
        }),
      ];

    // Non development plugins
    default:
      return [
        new CompressionPlugin({
          algorithm: "gzip",
          test: /\.(js|html|css)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
      ];
  }
})();

module.exports = {
  mode: config.get("development") ? "development" : "production",
  devtool: config.get("development")
    ? "cheap-module-eval-source-map"
    : undefined,
  cache: config.get("development"),

  entry: {
    app: [
      "react-hot-loader/patch",
      "whatwg-fetch",
      "core-js/es/object",
      "core-js/es/array",
      "core-js/es/symbol",
      "core-js/es/promise",
      "core-js/es/map",
      "core-js/es/set",
      "core-js/web/url-search-params.js",
      "./entry/client.tsx",
    ],
  },

  optimization: config.get("development")
    ? {}
    : {
        minimizer: [
          new TerserPlugin({
            parallel: true,
          }),
        ],
        splitChunks: {
          chunks: "all",
        },
      },

  performance: {
    hints: "warning",
    assetFilter(filename) {
      // Don't size test uncompressed javascript - we just care about the .js.gz files
      return !/\.(js|map)$/.test(filename);
    },
  },

  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalseO
  stats: {
    warningsFilter: /export .* was not found in/,
  },

  plugins: [
    new CopyPlugin([
      { from: "scripts/new-relic.js" },
      { from: "scripts/canny.js" },
      { from: "static" },
      { from: "config/environment.js" },
      { from: "config/environment.js.template" },
      { from: "config/web.config" },
    ]),

    /*
    Process index.html and insert script and stylesheet tags for us including config script
    */
    new HtmlWebpackPlugin({
      template: "./entry/index.html",
      inject: "body",
    }),

    // Don't proceed in generating code if there are errors
    new webpack.NoEmitOnErrorsPlugin(),

    // Show a nice progress bar on the console.
    new ProgressBarPlugin({
      clear: false,
    }),

    // new webpack.debug.ProfilingPlugin({
    //   outputPath: "client-build.json"
    // }),

    new ForkTsCheckerWebpackPlugin({}),

    ...(process.env.ANALYZE
      ? [
          new (require("webpack-bundle-analyzer").BundleAnalyzerPlugin)({
            analyzerMode: "static",
          }),
        ]
      : []),
  ].concat(environmentPlugins),

  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
    filename: config.get("development") ? "client.js" : "client.[hash].js",
    chunkFilename: config.get("development") ? "[name].js" : "[name].[hash].js",
    pathinfo: false,
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    modules: [path.resolve(__dirname, "../modules"), "node_modules"],
    alias: {
      "@material-ui/core": "@material-ui/core/es",
      "react-dom": "@hot-loader/react-dom",
    },
    symlinks: false,
  },

  module: {
    rules: [loaders.clientSideTypeScript, loaders.graphql].concat(
      loaders.allImagesAndFontsArray
    ),
  },

  devServer: {
    publicPath: "/",
    host: "0.0.0.0",
    port: DEV_PORT,
    hotOnly: true,
    historyApiFallback: true,
    stats: "errors-only",
    disableHostCheck: config.get("devServer.disableHostCheck"),
    proxy: {
      "/graphql/*": {
        secure: false,
        changeOrigin: true,
        target: `${PROXY_HOST}`,
      },
      "/api/*": { secure: false, changeOrigin: true, target: `${PROXY_HOST}` },
      "/internalapi/*": {
        secure: false,
        changeOrigin: true,
        target: `${PROXY_HOST}`,
      },
    },
  },
};
