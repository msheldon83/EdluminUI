import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid, Typography } from "@material-ui/core";
import { DeleteDialogRow } from "./row";
import { AbsVac } from "./types";

type Props = {
  name: string;
  absvacs: AbsVac[];
  className?: string;
};

export const DeleteDialogList: React.FC<Props> = ({
  name,
  absvacs,
  className,
}) => {
  const classes = useStyles();
  return (
    <>
      <Grid container className={className}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            className={classes.header}
          >{`${name[0].toUpperCase() +
            name.substring(1)} to delete:`}</Typography>
        </Grid>
        {absvacs.map(absvac => (
          <Grid item container key={absvac.id}>
            <DeleteDialogRow {...absvac} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(1),
    textAlign: "center",
  },
  header: {
    textAlign: "center",
  },
}));
