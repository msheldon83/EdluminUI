import * as React from "react";
import { useEffect } from "react";
import { useLoadingState } from ".";
import { LinearProgress, Fade, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

export const LoadingStateIndicatorFullScreen: React.FunctionComponent<{}> = props => {
  const classes = useStyles();
  const isLoading = useLoadingState().state === "fullScreen";

  return (
    <>
      <Fade in={isLoading} timeout={100} unmountOnExit>
        <div className={classes.overlayContainer}>
          <div className={classes.overlay}>
            <div className={classes.overlayContent}>
              <CircularProgress />
            </div>
          </div>
        </div>
      </Fade>
      {isLoading ? (
        <div className={classes.hiddenLoading}>{props.children}</div>
      ) : (
        props.children
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  overlay: {
    // backgroundColor: "green",
    flexGrow: 1,
    height: 0,
    overflow: "show",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  overlayContent: {
    // backgroundColor: "blue",
    alignItems: "center",
  },
  overlayContainer: {},
  hiddenLoading: {
    display: "none",
  },
}));
