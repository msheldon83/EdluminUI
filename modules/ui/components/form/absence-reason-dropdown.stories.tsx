import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import {
  AbsenceReasonDropdown,
  AbsenceReasonDropdownValue,
} from "./absence-reason-dropdown";

export const AbsenceReasonDropdownStory = () => {
  const classes = useStyles();

  const options = [
    {
      label: "1",
      value: "1",
    },
  ];

  const [absenceReason, setAbsenceReason] = React.useState<
    AbsenceReasonDropdownValue
  >({
    type: "no-allocation",
    selection: undefined,
  });

  return (
    <div className={classes.container}>
      <AbsenceReasonDropdown
        value={absenceReason}
        options={options}
        onChange={setAbsenceReason}
      />
    </div>
  );
};

AbsenceReasonDropdownStory.story = {
  name: "Absence Reason Dropdown",
};

const useStyles = makeStyles(theme => ({
  container: {
    background: "#fff",
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(480),
    width: "100%",
  },
}));
