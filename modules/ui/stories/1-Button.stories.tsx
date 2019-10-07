import * as React from "react";

import { action } from "@storybook/addon-actions";
import { Button } from "@material-ui/core";

export default {
  title: "Button",
};

export const muiButton = () => (
  <>
    <Button variant="contained" onClick={action("clicked")}>
      Material-UI button
    </Button>
  </>
);

muiButton.story = {
  name: "material-ui",
};
