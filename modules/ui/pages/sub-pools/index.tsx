import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Typography, Grid } from "@material-ui/core";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { EmployeeList } from "ui/components/employee-list";
import { AddEmployees } from "./components/add-employees";

type Props = {};

export const SubPool: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();

  //Query for Favorites & Blocked

  //Return 2 components for Favorite/Blocked Remove Employee List

  //Return 1 Component for Add/Block Employee List

  return (
    <>
      <Grid container spacing={2} xs={12}>
        <Grid item xs={12} sm={6} lg={6}>
          <EmployeeList title={t("Favorites for")} />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <EmployeeList title={t("Blocked by")} />
        </Grid>
      </Grid>
      <Grid container spacing={2} xs={12}>
        <Grid>
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
  // padding: {
  //   paddingRight: theme.spacing(10),
  // },
}));
