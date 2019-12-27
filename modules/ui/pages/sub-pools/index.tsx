import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography, Grid } from "@material-ui/core";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { PageTitle } from "ui/components/page-title";
import { EmployeeList } from "ui/components/employee-list";
import { AddEmployees } from "./components/add-employees";
import { GetSubstituteById } from "./graphql/get-substitute-by-id.gen";

type Props = { name: string };

export const SubPool: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PersonViewRoute);

  const getSubstituteById = useQueryBundle(GetSubstituteById, {
    variables: { id: params.orgUserId },
  });

  const substitute =
    getSubstituteById.state === "LOADING"
      ? undefined
      : getSubstituteById?.data?.orgUser?.byId?.substitute;

  if (getSubstituteById.state === "LOADING") {
    return <></>;
  }
  const fullName = substitute?.firstName + " " + substitute?.lastName;

  //Query for Favorites & Blocked
  const favorites = substitute?.substitutePoolMembership?.favoriteForEmployees;
  const blocked = substitute?.substitutePoolMembership?.blockedFromEmployees;

  return (
    <>
      <Typography className={classes.header} variant="h4">
        {t(fullName)}
      </Typography>
      <Grid item>
        <PageTitle title={t("Substitute pools")} />
      </Grid>
      <Grid container spacing={2} xs={12}>
        <Grid item xs={12} sm={6} lg={6}>
          <EmployeeList title={t("Favorites for")} peopleList={favorites} />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <EmployeeList title={t("Blocked by")} peopleList={blocked} />
        </Grid>
      </Grid>
      <Grid container spacing={2} xs={12}>
        <Grid item xs={12} sm={12} lg={12}>
          <AddEmployees title={t("Add")} />
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 400,
  },
}));
