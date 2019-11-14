import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { action } from "@storybook/addon-actions";
import { text, boolean, object, date } from "@storybook/addon-knobs";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { ActiveInactiveFilter } from "./active-inactive-filter";

const history = createBrowserHistory();

export const ActiveInactiveFilterStory = () => {
  const classes = useStyles();

  // This is the only way to see the query params because storybook uses an iframe
  React.useEffect(() => {
    history.listen(location => {
      action("Query Param Changed")(location.search);
    });
  }, []);

  return (
    <Router history={history}>
      <div className={classes.container}>
        <ActiveInactiveFilter onChange={action("onChange")} />
      </div>
    </Router>
  );
};

ActiveInactiveFilterStory.story = {
  name: "Active/Inactive Filter",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
  },
}));
