import { CircularProgress, Fade, LinearProgress } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import * as React from "react";

// Wait this long before showing any indicator
const SHOW_DELAY = 100;
const SHOW_DELAY_FS = 100;

// This is the debounce factor on hiding it - this way, if we finish a loading
// operation and start another within HIDE_DELAY time, it'll show up as one
// spinner and not flash.
const HIDE_DELAY = 100;
const HIDE_DELAY_FS = 250;

let SPINNER_IDX = 0;
function getSpinnerId() {
  return SPINNER_IDX++;
}

type LoadingState = {
  isShowingIndicator: boolean;
  isFullScreen: boolean;
  activeSpinners: Set<number>;
};

const DefaultLoadingState: LoadingState = {
  isShowingIndicator: false,
  isFullScreen: false,
  activeSpinners: new Set<number>(),
};

type LoadingStateAction = {
  status: "BEGIN" | "FINISH" | "DISPLAY";
  id: number;
  isFullScreen?: boolean;
};

/* The flow here is essentially:
 * When we BEGIN a loading operation, we track that operations id in a set.
 * If an operation is full screen, then we latch to full screen mode until all operations clear.
 * After SHOW_DELAY, if any operations are active then we will show the spinner.
 * When an operation finishes, we delay by HIDE_DELAY to allow a subsequent operation to begin.
 */
const loadingStateReducer = (
  state: LoadingState,
  action: LoadingStateAction
): LoadingState => {
  if (action && action.status == "BEGIN") {
    const activeSpinners = new Set(state.activeSpinners).add(action.id);
    // console.log("BEGIN", action.id, activeSpinners);
    return {
      ...state,
      activeSpinners,
      isFullScreen: state.isFullScreen || !!action.isFullScreen,
    };
  } else if (action && action.status == "FINISH") {
    const activeSpinners = new Set(state.activeSpinners);
    activeSpinners.delete(action.id);
    // console.log("FINISH", action.id, activeSpinners);
    return {
      ...state,
      activeSpinners: activeSpinners,

      // the only time we clear the fullscreen flag is when we hide all indicators
      isFullScreen: activeSpinners.size == 0 ? false : state.isFullScreen,

      // if we've finished everything, this will hide things. But we never
      // *show* based on things finishing.
      isShowingIndicator:
        state.isShowingIndicator && activeSpinners.size == 0
          ? false
          : state.isShowingIndicator,
    };
  } else if (action && action.status == "DISPLAY") {
    // console.log(
    //   "DISPLAY",
    //   action.id,
    //   state.activeSpinners.size > 0,
    //   state.activeSpinners.size == 0 ? false : state.isFullScreen
    // );
    return {
      ...state,
      isShowingIndicator: state.activeSpinners.size > 0,
    };
  } else {
    return state;
  }
};

// not sure why we need the 'as any'. I can't get the type to match, but
// whatever - we never rely on the default anyway.
export const PageLoadingContext = React.createContext<
  [LoadingState, React.Dispatch<LoadingStateAction>]
>([DefaultLoadingState, loadingStateReducer] as any);

export const PageLoadingProvider: React.FunctionComponent<{}> = props => {
  const dispatcher = React.useReducer(loadingStateReducer, DefaultLoadingState);
  return (
    <>
      <PageLoadingContext.Provider value={dispatcher}>
        {props.children}
      </PageLoadingContext.Provider>
    </>
  );
};

export const PageLoadingIndicator: React.FunctionComponent<{}> = props => {
  const classes = useStyles();

  return (
    <PageLoadingContext.Consumer>
      {([state, _]) => {
        const isLoading = state.isShowingIndicator && !state.isFullScreen;

        return (
          <>
            <Fade in={isLoading} timeout={SHOW_DELAY} unmountOnExit>
              <LinearProgress className={classes.progressBar} />
            </Fade>
          </>
        );
      }}
    </PageLoadingContext.Consumer>
  );
};

export const PageLoadingIndicatorFullScreen: React.FunctionComponent<{}> = props => {
  const classes = useStyles();

  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <PageLoadingContext.Consumer>
      {([state, _]) => {
        const isLoading = state.isShowingIndicator && state.isFullScreen;

        return (
          <>
            <Fade in={isLoading} timeout={SHOW_DELAY} unmountOnExit>
              <div className={classes.overlayContainer}>
                <div className={classes.overlay}>
                  <div className={classes.overlayContent}>
                    <CircularProgress />
                  </div>
                </div>
              </div>
            </Fade>
          </>
        );
      }}
    </PageLoadingContext.Consumer>
  );
};

export const useLoadingIndicator = __TEST__ /* eslint-disable-line no-undef */
  ? (x: any) => x
  : <R, T extends (...args: any[]) => Promise<R>>(
      func: T
    ): ((...funcArgs: Parameters<T>) => Promise<R>) => {
      const [loadingState, dispatchLoadingState] = React.useContext(
        PageLoadingContext
      );

      return React.useCallback(
        async (...args: Parameters<T>): Promise<R> => {
          const id = getSpinnerId();
          try {
            dispatchLoadingState({ id, status: "BEGIN" });
            setTimeout(() => {
              dispatchLoadingState({ id, status: "DISPLAY" });
            }, SHOW_DELAY);
            return await func(...args);
          } finally {
            setTimeout(() => {
              dispatchLoadingState({ id, status: "FINISH" });
            }, HIDE_DELAY);
          }
        },
        [dispatchLoadingState, func]
      );
    };

export const PageLoadingTrigger: React.FunctionComponent<{
  fullScreen?: boolean;
}> = props => {
  const [loadingState, dispatchLoadingState] = React.useContext(
    PageLoadingContext
  );

  React.useEffect(() => {
    if (__TEST__ /* eslint-disable-line */) {
      return;
    }
    const id = getSpinnerId();
    dispatchLoadingState({
      id,
      status: "BEGIN",
      isFullScreen: props.fullScreen,
    });
    setTimeout(
      () => {
        dispatchLoadingState({ id, status: "DISPLAY" });
      },
      loadingState.isFullScreen ? SHOW_DELAY_FS : SHOW_DELAY
    );

    return () => {
      setTimeout(
        () => {
          dispatchLoadingState({ id, status: "FINISH" });
        },
        loadingState.isFullScreen ? HIDE_DELAY_FS : HIDE_DELAY
      );
    };
  }, [props.fullScreen, loadingState.isFullScreen, dispatchLoadingState]);

  return <></>;
};

const useStyles = makeStyles(theme => ({
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
  },
  overlay: {
    backgroundColor: theme.customColors.appBackgroundGray,
    position: "absolute",
    zIndex: 100,
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  overlayContent: {
    minHeight: "10em",
  },
  overlayContainer: {
    position: "relative",
  },
}));
