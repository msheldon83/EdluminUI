const config = require("config");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
const loaders = require("./loaders");
const fs = require("fs");

const scriptsNeededForTests = [];

const scriptsDir = path.join(__dirname, "../entry/scripts");

const scriptEntry = fs
  .readdirSync(scriptsDir)
  .filter(f => scriptsNeededForTests.includes(f))
  .filter(f => /\.tsx?$/.test(f))
  .filter(f => fs.statSync(path.join(scriptsDir, f)).isFile())
  .reduce((o, f) => {
    o[`scripts/${f.replace(/\.tsx?$/, "")}`] = path.resolve(
      path.join(scriptsDir, f)
    );
    return o;
  }, {});

const entry = scriptEntry;
console.log("entry points:");
console.log(entry);

module.exports = {
  entry: entry,
  // Never minify the server
  mode: "development",
  target: "node",

  //devtool: "source-map",
  devtool: "inline-source-map",
  optimization: {
    // Don't turn process.env.NODE_ENV into a compile-time constant
    nodeEnv: false,
  },
  context: `${__dirname}/../`,

  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js",
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    libraryTarget: "commonjs2",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [path.resolve(__dirname, "../modules"), "node_modules"],
  },

  externals: [
    nodeExternals({
      whitelist: [/^lodash-es/],
    }),
  ],
  module: {
    rules: [loaders.typescript, loaders.graphql],
  },

  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalseO
  stats: {
    warningsFilter: /export .* was not found in/,
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),

    new webpack.DefinePlugin({
      __TEST__: "false",
      __DEV__: JSON.stringify(config.get("isDevelopment")),
    }),
  ],
};
