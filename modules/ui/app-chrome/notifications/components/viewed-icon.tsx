import * as React from "react";
import { makeStyles } from "@material-ui/core";
import Brightness1Icon from "@material-ui/icons/Brightness1";

type Props = {
  viewed: boolean;
};

export const ViewedIcon: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <>
      {props.viewed ? (
        <Brightness1Icon className={classes.viewed} />
      ) : (
        <Brightness1Icon className={classes.notViewed} />
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  viewed: {
    color: theme.customColors.edluminLightSlate,
  },
  notViewed: {
    color: theme.customColors.warning,
  },
}));
