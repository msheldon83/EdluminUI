import * as React from "react";
import { LinearProgress, makeStyles } from "@material-ui/core";

type Props = {
  verifiedAssignments: number;
  totalAssignments: number;
};

export const ProgressBar: React.FC<Props> = ({
  verifiedAssignments,
  totalAssignments,
}) => {
  const classes = useStyles();

  return (
    <LinearProgress
      variant="determinate"
      color={verifiedAssignments == totalAssignments ? "secondary" : "primary"}
      value={
        verifiedAssignments == totalAssignments
          ? 100
          : (100 * verifiedAssignments) / totalAssignments
      }
      classes={classes}
    />
  );
};

const useStyles = makeStyles(theme => ({
  // Applied to the root element
  root: {
    height: "10px",
    borderRadius: "10px",
  },
  // Controls the color of the verified part of an in-progress bar
  barColorPrimary: {
    backgroundColor: theme.customColors.edluminSlate,
  },
  // Controls the color of the unverified part of an in-progress bar
  colorPrimary: {
    backgroundColor: theme.customColors.gray,
  },
  // Controls the color a finished bar
  barColorSecondary: {
    backgroundColor: theme.customColors.success,
  },
}));
