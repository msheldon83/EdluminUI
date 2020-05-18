import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import { AccountingCodeDropdown } from "./accounting-code-dropdown";

export const AccountingCodeDropdownStory = () => {
  const classes = useStyles();

  const options = [
    {
      label: "1.1111.1240.000.0000.07527.0001",
      value: "1.1111.1240.000.0000.07527.0001",
    },
    {
      label: "1.1111.1240.000.0000.07527.0002",
      value: "1.1111.1240.000.0000.07527.0002",
    },
    {
      label: "1.1111.1240.000.0000.07527.0003",
      value: "1.1111.1240.000.0000.07527.0003",
    },
    {
      label: "1.1111.1240.000.0000.07527.0005",
      value: "1.1111.1240.000.0000.07527.0005",
    },
    {
      label: "1.1111.1240.000.0000.07527.0006",
      value: "1.1111.1240.000.0000.07527.0006",
    },
    {
      label: "1.1111.1240.000.0000.07527.0007",
      value: "1.1111.1240.000.0000.07527.0007",
    },
  ];

  return (
    <div className={classes.container}>
      <AccountingCodeDropdown options={options} />
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
