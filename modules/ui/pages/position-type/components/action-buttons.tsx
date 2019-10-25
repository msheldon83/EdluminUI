import * as React from "react";
import { makeStyles, Grid, Button } from "@material-ui/core";

type Props = {
  submit: Action;
  cancel: Action;
};
type Action = {
  text: string;
  execute: Function;
};

export const ActionButtons: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Grid container justify="flex-end" spacing={2} className={classes.actions}>
      <Grid item>
        <Button
          variant="outlined"
          onClick={() => {
            props.cancel.execute();
          }}
        >
          {props.cancel.text}
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={() => props.submit.execute()}>
          {props.submit.text}
        </Button>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  actions: {
    marginTop: theme.spacing(4),
  },
}));
