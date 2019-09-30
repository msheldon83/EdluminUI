const config = require("config");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const loaders = require("./loaders");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const RollbarSourceMapPlugin = require("rollbar-sourcemap-webpack-plugin");
const { execSync } = require("child_process");

const os = require("os");
const DEV_PORT = config.get("devServer.port");

const PROXY_HOST = config.get("server.apiHost");

function codeVersion() {
  return (
    process.env.SOURCE_VERSION ||
    execSync("git rev-parse --short HEAD")
      .toString()
      .trim()
  );
}

////////////////////////////////////////////////////////////////////////////////
// per-environment plugins
const environmentPlugins = (() => {
  if (config.get("minify")) {
    return [
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|html|css)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
    ];
  }

  switch (process.env.NODE_ENV) {
    case "development":
      return [
        // Hot reloading is set up in webpack-dev-server.js
      ];

    default:
      return [];
  }
})();

const sourceMapsMode = () =>
  process.env.NODE_ENV == "development"
    ? "inline-source-map"
    : "hidden-source-map";

module.exports = {
  mode: config.get("minify") ? "production" : "development",

  devtool: sourceMapsMode(),

  entry: {
    app: [
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

  optimization: config.get("minify")
    ? {
        splitChunks: {
          chunks: "all",
          // cacheGroups: {
          //   commons: {
          //     test: /[\\/]node_modules[\\/]/,
          //     name: "vendors",
          //     chunks: "all",
          //   },
          // },
        },
      }
    : undefined,

  performance: {
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
    // new HardSourceWebpackPlugin(),

    // Define global letiables in the client to instrument behavior.
    new webpack.DefinePlugin({
      // Flag to detect non-production
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      __TEST__: "false",

      "process.env.ENABLE_DEVELOPER_LOGIN": config.get(
        "server.enableDeveloperLogin"
      ),

      // Allow checking of USE_FAKE_DATA in client (mainly for the big bad reset button)
      "process.env.USE_FAKE_DATA": JSON.stringify(process.env.USE_FAKE_DATA),

      // ALlow switching on NODE_ENV in client code
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),

      // Expose Google Analytics ID to client
      "process.env.TRACKING_ID": JSON.stringify(process.env.TRACKING_ID),

      "process.env.ROLLBAR_CLIENT_ACCESS_TOKEN": JSON.stringify(
        config.get("rollbar.clientAccessToken")
      ),

      "process.env.IDENTITY_PROVIDER_HOST_LOGIN": JSON.stringify(
        process.env.IDENTITY_PROVIDER_HOST_LOGIN
      ),

      "process.env.CODE_VERSION": JSON.stringify(codeVersion()),
    }),

    // Process index.html and insert script and stylesheet tags for us.
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
          new (require("webpack-bundle-analyzer")).BundleAnalyzerPlugin({
            analyzerMode: "static",
          }),
        ]
      : []),
  ].concat(environmentPlugins),

  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
    filename: config.get("minify") ? "client.[chunkhash].js" : "client.js",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    modules: [path.resolve(__dirname, "../modules"), "node_modules"],
    alias: {
      "@material-ui/core": "@material-ui/core/es",
    },
  },

  module: {
    rules: [
      {
        // Transpile non-IE compatible node modules.
        test: /\.jsx?$/,
        // Whitelist the modules inside the () in this regex:
        include: /node_modules\/(@material-ui)\//,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      loaders.clientSideTypeScript,
      loaders.graphql,
    ].concat(loaders.allImagesAndFontsArray),
  },
  devServer: {
    publicPath: "/",
    host: "0.0.0.0",
    port: DEV_PORT,
    hot: false,
    historyApiFallback: true,
    stats: "errors-only",
    disableHostCheck: config.get("devServer.disableHostCheck"),
    proxy: {
      "/graphql/*": `http://${PROXY_HOST}`,
      "/graphiql/*": `http://${PROXY_HOST}`,
      "/auth/*": `http://${PROXY_HOST}`,
      "/arena/*": `http://${PROXY_HOST}`,
      "/api/*": `http://${PROXY_HOST}`,
      "/dangerous-reset": `http://${PROXY_HOST}`,
    },
  },
};

// Upload source maps to Rollbar
if (
  process.env.NODE_ENV === "production" &&
  config.get("rollbar.serverAccessToken")
) {
  module.exports.plugins.push(
    new RollbarSourceMapPlugin({
      accessToken: config.get("rollbar.serverAccessToken"),
      version: codeVersion(),
      publicPath: `//${config.get("server.publicHost")}`,
      // publicPath: "//localhost:3001", // for development - run make app with the rollbar tokens and production env
    })
  );
}