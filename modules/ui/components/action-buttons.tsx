import * as React from "react";
import { makeStyles, Grid, Button } from "@material-ui/core";

type Props = {
  submit: Action;
  cancel: Action;
  additionalActions?: Array<Action>;
};
type Action = {
  text: string;
  execute: Function;
  disabled?: boolean;
};

export const ActionButtons: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Grid container justify="space-between" className={classes.actions}>
      <Grid container item justify="flex-start" spacing={2} xs={8}>
        {props.additionalActions &&
          props.additionalActions.map((a, i) => (
            <Grid item key={i}>
              <Button variant="outlined" onClick={() => a.execute()}>
                {a.text}
              </Button>
            </Grid>
          ))}
      </Grid>
      <Grid container item justify="flex-end" spacing={2} xs={4}>
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
          <Button
            variant="contained"
            onClick={() => props.submit.execute()}
            disabled={props.submit.disabled}
          >
            {props.submit.text}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  actions: {
    marginTop: theme.spacing(4),
  },
}));
