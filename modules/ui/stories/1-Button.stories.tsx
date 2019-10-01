import * as React from "react";

import { action } from "@storybook/addon-actions";

export default {
  title: "Button",
};

export const emoji = () => (
  <button onClick={action("clicked")}>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </button>
);

emoji.story = {
  name: "with emoji",
};
