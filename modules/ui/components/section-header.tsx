import * as React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { Grid, Button } from "@material-ui/core";

type Props = {
  title: string;
  action?: Action;
  cancel?: Action;
  submit?: Action;
};
type Action = {
  text: string;
  visible: boolean;
  execute: Function;
};

export const SectionHeader: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Grid
      container
      className={classes.header}
      justify="space-between"
      alignItems="center"
    >
      <Grid item>
        <Typography variant="h5">{props.title}</Typography>
      </Grid>
      <Grid item>
        {props.action && props.action.visible && (
          <Button variant="outlined" onClick={() => props.action!.execute()}>
            {props.action.text}
          </Button>
        )}
        {props.cancel && props.cancel.visible && (
          <Button variant="outlined" onClick={() => props.cancel!.execute()}>
            {props.cancel.text}
          </Button>
        )}
        {props.submit && props.submit.visible && (
          <Button variant="contained" onClick={() => props.submit!.execute()}>
            {props.submit.text}
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
}));
