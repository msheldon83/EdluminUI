import { makeStyles, useTheme } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";

type Props = {};

export const AdminHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const params = useRouteParams(AdminHomeRoute);

  return (
    <>
      <PageTitle title={`${params.organizationId} ${t("Home")}`} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
