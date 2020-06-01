import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { PageTitle } from "ui/components/page-title";
import { Typography, Grid } from "@material-ui/core";

type Props = {
  header: string;
  subHeader: string;
  message: string;
};

export const DeletedData: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        spacing={2}
        className={classes.headerContainer}
      >
        <Grid item xs={10}>
          <Typography variant="h6" className={classes.header}>
            {props.header}
          </Typography>
          <PageTitle title={props.subHeader} />
        </Grid>
        <Grid item xs={10}>
          <div className={classes.noteText}>{props.message}</div>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  noteText: {
    backgroundColor: "#FFBAB9",
    padding: theme.spacing(2),
    float: "left",
  },
  header: {
    backgroundColor: "#FF5555",
  },
  headerContainer: {
    marginBottom: theme.spacing(1),
  },
}));
