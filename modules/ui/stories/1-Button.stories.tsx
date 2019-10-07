import { Button } from "@material-ui/core";
import { action } from "@storybook/addon-actions";
import * as React from "react";

export default {
  title: "Button",
};

export const muiButton = () => (
  <Button variant="contained" color="primary" onClick={action("clicked")}>
    Material-UI button
  </Button>
);

muiButton.story = {
  name: "material-ui",
};
