import * as React from "react";
import { useEffect } from "react";
import { useLoadingState } from ".";
import { LinearProgress, Fade } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

type Props = {};
export const LoadingStateIndicator: React.FC<Props> = props => {
  const state = useLoadingState();
  const show = state.state === "loading";
  const classes = useStyles();

  return (
    <Fade in={show} timeout={100} unmountOnExit>
      <LinearProgress className={classes.progressBar} color="primary" />
    </Fade>
  );
};

const useStyles = makeStyles({
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000000,
  },
});
