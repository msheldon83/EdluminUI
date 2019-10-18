import { Grid, makeStyles } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import * as React from "react";

type Props = {
  text: JSX.Element;
  className?: string;
};

export const InformationHelperText: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Grid
      container
      alignItems="center"
      className={`${classes.info} ${props.className}`}
    >
      <InfoIcon fontSize="small" />
      <Grid item className={classes.infoText}>
        {props.text}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  info: {
    opacity: 0.6,
  },
  infoText: {
    paddingLeft: theme.spacing(1),
  },
}));
