import * as React from "react";
import { makeStyles, Typography, Grid, Button } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "./auth/can";

type Props = {
  title: string;
  className?: string;
  actions?: Action[];
  cancel?: Action;
  submit?: Action;
  titleClassName?: string;
};
type Action = {
  text: string;
  visible: boolean;
  execute: Function;
  permissions?: PermissionEnum[];
};

export const SectionHeader: React.FC<Props> = props => {
  const { titleClassName = "" } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      className={[classes.header, props.className].join(" ")}
      justify="space-between"
      alignItems="center"
    >
      <Grid item>
        <Typography
          variant="h5"
          className={`${classes.title} ${titleClassName}`}
        >
          {props.title}
        </Typography>
      </Grid>
      <Grid item>
        {props.actions &&
          props.actions.map((action, index) => {
            if (action.visible) {
              return action.permissions ? (
                <Can do={action.permissions} key={index}>
                  <Button
                    variant="outlined"
                    onClick={() => action.execute()}
                    className={classes.actionButon}
                  >
                    {action.text}
                  </Button>
                </Can>
              ) : (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => action.execute()}
                  className={classes.actionButon}
                >
                  {action.text}
                </Button>
              );
            }
          })}
        {props.cancel && props.cancel.visible && (
          <Button
            variant="outlined"
            onClick={() => props.cancel!.execute()}
            className={classes.actionButon}
          >
            {props.cancel.text}
          </Button>
        )}
        {props.submit && props.submit.visible && (
          <Button
            variant="contained"
            onClick={() => props.submit!.execute()}
            className={classes.actionButon}
          >
            {props.submit.text}
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    [theme.breakpoints.up("md")]: {
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  actionButon: {
    marginLeft: theme.spacing(2),
  },
}));
