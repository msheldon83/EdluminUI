import * as React from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { AbsVacLink } from "ui/components/links/abs-vac";
import { AbsenceReason } from "./types";

export const DeleteCategoryDialogRow: React.FC<AbsenceReason> = ({
  name,
  description,
}) => {
  const classes = useStyles();
  return (
    <Grid item container spacing={1}>
      <Grid item xs={6} className={classes.left}>
        {name}
      </Grid>
      <Grid item xs={6} className={classes.right}>
        {description}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  left: {
    textAlign: "left",
  },
  right: {
    textAlign: "right",
  },
}));
