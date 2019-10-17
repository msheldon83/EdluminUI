import * as React from "react";
import { Example } from "ui/pages/index/Example.gen";
import { useQueryBundle } from "graphql/hooks";
import { useAuth0 } from "auth/auth0";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { NavigationSideBar } from "ui/app-chrome/navigation";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";

export const ExamplePage: React.FunctionComponent = props => {
  const classes = useStyles();
  const { isAuthenticated: loggedIn, logout } = useAuth0();
  const data = useQueryBundle(Example, {
    skip: !loggedIn,
  });
  const { t } = useTranslation();
  /* cf 2019-10-16
    this is not a good example of how to do anything relating to grapqhl.
    if you're seeking patterns to follow, look elsewhere.
    */
  let name =
    (data.state === "DONE" || data.state === "UPDATING") &&
    data.data.userAccess &&
    data.data.userAccess.me &&
    data.data.userAccess.me.user &&
    data.data.userAccess.me.user.id
      ? data.data.userAccess.me.user.id
      : "anonymous";
  if (data.state !== "DONE" && data.state !== "UPDATING") name = "...";
  return (
    <>
      <PageTitle title={t("Home")} />
      <div className={classes.name}>Hello {name}</div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  name: {
    backgroundColor: theme.customColors.mustard,
    padding: theme.typography.pxToRem(24),
    marginTop: theme.typography.pxToRem(18),
  },
}));
