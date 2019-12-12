import * as React from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

type PeopleGridItemProps = {
  title: React.ReactNode;
  description: React.ReactNode;
};

export const PeopleGridItem = ({ title, description }: PeopleGridItemProps) => {
  const classes = useStyles();

  return (
    <Grid item xs={12} sm={6} lg={6}>
      <dt className={classes.title}>{title}</dt>
      <dd className={classes.description}>{description}</dd>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  description: {
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(21),
    margin: 0,
  },
  title: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    lineHeight: theme.typography.pxToRem(24),
  },
}));
