import * as React from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, select } from "@storybook/addon-knobs";
import { makeStyles } from "@material-ui/core/styles";
import {
  AbsenceReasonDropdown,
  AbsenceReasonDropdownValue,
} from "./absence-reason-dropdown";
import { noAllocation } from "./allocation-dropdown";

export const AbsenceReasonDropdownStory = () => {
  const classes = useStyles();

  const options = [
    {
      label: "A Days Reason",
      value: "a-days-reason",
      descriptor: "DAYS",
    },
    {
      label: "An Hours Reason",
      value: "an-hours-reason",
      descriptor: "HOURS",
    },
    {
      label: "Another Hours Reason",
      value: "another-hours-reason",
      descriptor: "HOURS",
    },
  ];

  const [absenceReason, setAbsenceReason] = React.useState<
    AbsenceReasonDropdownValue
  >(noAllocation());

  // console.log("absenceReason", absenceReason);

  return (
    <div className={classes.container}>
      <AbsenceReasonDropdown
        value={absenceReason}
        options={options}
        onChange={setAbsenceReason}
        hoursInADay={8}
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
