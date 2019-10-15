import * as React from "react";
import { useEffect } from "react";
import { useLoadingState } from ".";

type Props = {
  fullScreen?: boolean;
  debugMsg?: string;
};
export const LoadingStateTrigger: React.FC<Props> = ({
  fullScreen,
  debugMsg,
}) => {
  const start = useLoadingState().start;
  useEffect(() => start(fullScreen == true, debugMsg), [
    start,
    fullScreen,
    debugMsg,
  ]);
  return <></>;
};
