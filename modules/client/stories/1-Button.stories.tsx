import * as React from "react";

import { action } from "@storybook/addon-actions";

export default {
  title: "Button",
};

export const emoji = () => (
  <div onClick={action("clicked")}>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </div>
);

emoji.story = {
  name: "with emoji",
};
