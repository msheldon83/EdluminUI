import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import { not } from "helpers";
import { range } from "lodash-es";
import * as React from "react";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";
import { AppChrome } from ".";
import { mockProvider } from "test-helpers/mock-provider";
import { Route } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { AppChromeRoute } from "ui/routes/app-chrome";

export default {
  title: "App Chrome",
};

export const AppChromeStory = () => {
  const Provider = mockProvider();
  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <AppChrome>
          <PageTitle title="This is my page title" />
          {range(100).map((_, i) => (
            <p key={i}>this is my page content</p>
          ))}
        </AppChrome>
      </Route>
    </Provider>
  );
};

AppChromeStory.story = {
  name: "Basic",
};

export const AppChromeLoading = () => {
  const Provider = mockProvider();
  const classes = useStyles();
  const [isLoading, setIsLoading] = React.useState(true);
  const toggleLoading = React.useCallback(() => setIsLoading(not), [
    setIsLoading,
  ]);

  const [isLoadingFullScreen, setIsLoadingFullScreen] = React.useState(false);
  const toggleLoadingFullScreen = React.useCallback(
    () => setIsLoadingFullScreen(not),
    [setIsLoadingFullScreen]
  );
  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <AppChrome>
          {isLoading && <LoadingStateTrigger />}
          {isLoadingFullScreen && <LoadingStateTrigger fullScreen />}
          {range(100).map((_, i) => (
            <p key={i}>this is my page content</p>
          ))}
        </AppChrome>
      </Route>
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
    </Provider>
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

export const AppChromeError = () => {
  const Provider = mockProvider();
  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <AppChrome>
          <ComponentWithError />
        </AppChrome>
      </Route>
    </Provider>
  );
};

class ComponentWithError extends React.Component<object, {}> {
  render() {
    throw "Error";
    return <h1>Hello</h1>;
  }
}

AppChromeError.story = {
  name: "Error",
};
