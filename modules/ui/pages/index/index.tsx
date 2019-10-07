import * as React from "react";
import { Example } from "graphql/queries/Example.gen";
import { useQueryBundle } from "graphql/hooks";
import { useAuth0 } from "auth/auth0";
import { makeStyles } from "@material-ui/styles";

export const ExamplePage: React.FunctionComponent = props => {
  const classes = useStyles();
  const loggedIn = useAuth0().isAuthenticated;
  const data = useQueryBundle(Example, { skip: !loggedIn });
  const name =
    data.state === "DONE" &&
    data.data.userAccess &&
    data.data.userAccess.me &&
    data.data.userAccess.me.user &&
    data.data.userAccess.me.user.id
      ? data.data.userAccess.me.user.id
      : "anonymous";
  return <div className={classes.name}>Hello {name}</div>;
};

const useStyles = makeStyles(theme => ({
  name: {
    backgroundColor: theme.customColors.mustard,
    padding: theme.typography.pxToRem(24),
    marginTop: theme.typography.pxToRem(18),
  },
}));
