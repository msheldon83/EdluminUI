import * as React from "react";

import { action } from "@storybook/addon-actions";
import { Button } from "@material-ui/core";

export default {
  title: "Button",
};

export const emoji = () => (
  <>
    <button onClick={action("clicked")}>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </button>
    <Button variant="contained" onClick={action("clicked2")}>
      Material-UI button
    </Button>
  </>
);

emoji.story = {
  name: "with emoji",
};
