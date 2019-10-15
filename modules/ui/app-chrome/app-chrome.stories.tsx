import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import { not } from "helpers";
import { range } from "lodash-es";
import * as React from "react";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";
import { AppChrome } from ".";

export default {
  title: "App Chrome",
};

export const AppChromeStory = () => {
  return <AppChrome>page content here</AppChrome>;
};

AppChromeStory.story = {
  name: "Basic",
};

export const AppChromeLoading = () => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = React.useState(true);
  const toggleLoading = React.useCallback(() => setIsLoading(not), [
    setIsLoading,
  ]);

  const [isLoadingFullScreen, setIsLoadingFullScreen] = React.useState(false);
  const toggleLoadingFullScreen = React.useCallback(
    () => setIsLoadingFullScreen(not),
    [setIsLoading]
  );
  return (
    <>
      <AppChrome>
        {isLoading && <LoadingStateTrigger />}
        {isLoadingFullScreen && <LoadingStateTrigger fullScreen />}
        {range(100).map((_, i) => (
          <p key={i}>this is my page content</p>
        ))}
      </AppChrome>
      <div className={classes.controls}>
        <div>
          <FormControlLabel
            label="Loading"
            control={<Checkbox />}
            onChange={toggleLoading}
            checked={isLoading}
          ></FormControlLabel>
        </div>
        <div>
          <FormControlLabel
            label="Loading (full screen)"
            control={<Checkbox />}
            onChange={toggleLoadingFullScreen}
            checked={isLoadingFullScreen}
          ></FormControlLabel>
        </div>
      </div>
    </>
  );
};

AppChromeLoading.story = {
  name: "Loading",
};

const useStyles = makeStyles({
  controls: {
    backgroundColor: "white",
    position: "absolute",
    top: "400px",
    left: "50px",
    zIndex: 5000,
  },
});
