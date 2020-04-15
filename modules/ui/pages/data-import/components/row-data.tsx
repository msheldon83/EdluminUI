import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Maybe } from "graphql/server-types.gen";

type Props = {
  columnNames: Maybe<string>[];
  columns: Maybe<string>[];
};

export const DataImportRowData: React.FC<Props> = props => {
  const classes = useStyles();

  const { columnNames, columns } = props;
  return (
    <div className={classes.container}>
      <Grid container spacing={2}>
        {columns.map((c, i) => {
          return (
            <Grid item container key={i} xs={12}>
              <Grid item xs={6}>
                <div>{columnNames[i]}</div>
              </Grid>
              <Grid item xs={6}>
                <div>{c}</div>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));
