import * as React from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { AbsVacLink } from "ui/components/links/abs-vac";
import { AbsVac } from "./types";

export const DeleteDialogRow: React.FC<AbsVac> = ({
  id,
  dateRangeDisplay,
  type,
}) => {
  const classes = useStyles();
  return (
    <>
      <Grid item xs={6} className={classes.left}>
        {dateRangeDisplay}
      </Grid>
      <Grid item xs={6} className={classes.right}>
        <AbsVacLink absVacId={id} absVacType={type} target="_blank" />
      </Grid>
    </>
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
