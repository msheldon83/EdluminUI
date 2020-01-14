import { Grid, Button, makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { LocationGroupsRoute } from "ui/routes/location-groups";
import { useRouteParams } from "ui/routes/definition";
import { LocationGroupsUI } from "./ui";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {};

export const LocationGroups: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(LocationGroupsRoute);

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
        <Can
          do={[PermissionEnum.LocationGroupSave]}
          orgId={params.organizationId}
        >
          <Grid item>
            <Button
              variant="contained"
              //component={Link}
              //to={ROUTE_GOES_HERE.generate(params)} Generate correct Route for ADD
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
