import { Grid, Button, makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { LocationGroupAddRoute } from "ui/routes/location-groups";
import { Link } from "react-router-dom";
import { LocationGroupsUI } from "./ui";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {};

export const LocationGroups: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(LocationGroupAddRoute);

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <PageTitle title={t("School Groups")} />
        <Can do={[PermissionEnum.LocationGroupSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={LocationGroupAddRoute.generate(params)}
            >
              {t("Add School Group")}
            </Button>
          </Grid>
        </Can>
      </Grid>
      <LocationGroupsUI />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));
