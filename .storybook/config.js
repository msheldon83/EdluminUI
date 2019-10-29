import { configure, addDecorator } from "@storybook/react";
import { withTheme } from "storybook/with-theme";
import { withKnobs } from "@storybook/addon-knobs";

// automatically import all files ending in *.stories.js
configure(
  require.context("../modules/", true, /\.stories\.(js|jsx|tsx)$/),
  module
);

addDecorator(withTheme);
addDecorator(withKnobs);
