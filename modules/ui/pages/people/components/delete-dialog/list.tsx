import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid, Typography } from "@material-ui/core";
import { DeleteDialogRow } from "./row";
import { AbsVac } from "./types";

type Props = {
  name: string;
  absvacs: AbsVac[] | undefined;
  className?: string;
};

export const DeleteDialogList: React.FC<Props> = ({
  name,
  absvacs,
  className,
}) => {
  const classes = useStyles();
  return absvacs && absvacs.length > 0 ? (
    <Grid container className={className}>
      {absvacs.map(absvac => (
        <Grid item container key={absvac.id}>
          <DeleteDialogRow {...absvac} />
        </Grid>
      ))}
    </Grid>
  ) : (
    <Typography className={classes.empty}>{`No upcoming ${name}`}</Typography>
  );
};

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(1),
  },
}));
