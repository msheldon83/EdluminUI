import { configure } from "@storybook/react";

// automatically import all files ending in *.stories.js
configure(
  require.context("../modules/client", true, /\.stories\.(js|jsx|tsx)$/),
  module
);