import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { AccountingCodeDropdown } from "./accounting-code-dropdown";

export const AccountingCodeDropdownStory = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <AccountingCodeDropdown />
    </div>
  );
};

AccountingCodeDropdownStory.story = {
  name: "Accounting Code Dropdown",
};

const useStyles = makeStyles(theme => ({
  container: {
    background: "#fff",
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(400),
    width: "100%",
  },
}));
