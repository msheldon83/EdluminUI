// // you can use this file to add your custom webpack plugins, loaders and anything you like.
// // This is just the basic way to add additional webpack configurations.
// // For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// // IMPORTANT
// // When you add this file, we won't add the default configurations which is similar
// // to "React Create App". This only has babel loader to load JavaScript.

// module.exports = {
//   plugins: [
//     // your custom plugins
//   ],
//   module: {
//     rules: [
//       // add your custom rules.
//     ],
//   },
// };

const path = require("path");
const loaders = require("../webpack/loaders");
var ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const os = require("os");
const webpack = require("webpack");

// Export a function. Accept the base config as the only param.
module.exports = ({ config, mode }) => {
  // configType has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // Make whatever fine-grained changes you need
  config.module.rules.push(
    {
      test: /\.s?css$/,
      loaders: [
        "style-loader",
        "css-loader",
        {
          loader: "sass-loader",
          options: {
            includePaths: [path.resolve(__dirname, "../modules")],
          },
        },
      ],
      include: path.resolve(__dirname, "../"),
    },
    loaders.mjs,
    loaders.clientSideTypeScript,
    loaders.graphql
    // this seems to break images in storybook:
    // ...loaders.allImagesAndFontsArray
  );

  config.resolve.extensions.push(".ts", ".tsx");
  config.resolve.modules.unshift(path.resolve(__dirname, "../modules"));

  config.plugins.push(
    new webpack.DefinePlugin({
      __TEST__: "false",
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    })
  );
  if (process.env.STACK) {
    console.log("Skipping storybook typecheck during heroku build.");
  } else {
    config.plugins.push(new ForkTsCheckerWebpackPlugin({}));
  }

  // Return the altered config
  return config;
};
