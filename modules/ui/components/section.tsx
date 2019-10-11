import * as React from "react";
import { Paper, makeStyles } from "@material-ui/core";

type Props = {};
export const Section: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.section}>
      {props.children}
    </Paper>
  );
};

const useStyles = makeStyles(theme => ({
  section: {
    borderRadius: theme.typography.pxToRem(5),
    borderWidth: theme.typography.pxToRem(1),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    padding: theme.spacing(4),
  },
}));
