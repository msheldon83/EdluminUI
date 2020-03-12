import * as React from "react";
import { Reducer, useCallback, useMemo, useReducer, useRef } from "react";

type LoadingState = {
  fullScreen: boolean;
  activeProcesses: Array<{
    id: number;
    debugMsg?: string;
    fullScreen: boolean;
  }>;
};

const StartingState: LoadingState = {
  fullScreen: false,
  activeProcesses: [],
};

type LoadingAction =
  | {
      type: "start";
      id: number;
      fullScreen: boolean;
      debugMsg?: string;
    }
  | {
      type: "stop";
      id: number;
    };
const loadingStateReducer: Reducer<LoadingState, LoadingAction> = (
  s,
  action
) => {
  switch (action.type) {
    case "start": {
      return {
        fullScreen: s.fullScreen || action.fullScreen,
        activeProcesses: [
          ...s.activeProcesses,
          {
            id: action.id,
            debugMsg: action.debugMsg,
            fullScreen: action.fullScreen,
          },
        ],
      };
    }
    case "stop": {
      const remainingProcesses = s.activeProcesses.filter(
        p => p.id !== action.id
      );
      if (remainingProcesses.length > 0) {
        return { ...s, activeProcesses: remainingProcesses };
      }
      return StartingState;
    }
  }
};

type LoadingStateContext = {
  state: "off" | "loading" | "fullScreen";
  start: (fullScreen: boolean, debugMsg?: string) => () => void;
};
const LoadingStateContext = React.createContext<LoadingStateContext>({
  state: "off",
  start: () => {
    console.warn("No LoadingStateProvider in tree!");
    return () => {};
  },
});

type Props = {};
export const LoadingStateProvider: React.FC<Props> = ({ children }) => {
  const nextId = useRef<number>(0);
  const [state, dispatch] = useReducer(loadingStateReducer, StartingState);
  const start = useCallback(
    (fullScreen, debugMsg) => {
      const id = nextId.current++;
      dispatch({ type: "start", id, debugMsg, fullScreen });
      return () => dispatch({ type: "stop", id });
    },
    [dispatch, nextId]
  );
  const ctx: LoadingStateContext = useMemo(
    () => ({
      start,
      state:
        state.activeProcesses.length > 0
          ? state.fullScreen
            ? "fullScreen"
            : "loading"
          : "off",
    }),
    [start, state.activeProcesses, state.fullScreen]
  );
  return (
    <LoadingStateContext.Provider value={ctx}>
      {children}
    </LoadingStateContext.Provider>
  );
};

export const useLoadingState = () => React.useContext(LoadingStateContext);
