import * as React from "react";
import { useTranslation } from "react-i18next";
import { Filters } from "./components/filters";
import { Section } from "ui/components/section";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { LocationsRoute, LocationAddRoute } from "ui/routes/locations";
import { useRouteParams } from "ui/routes/definition";
import { LocationsUI } from "./ui";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, DataImportType } from "graphql/server-types.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";

type Props = {};

export const Locations: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [locationGroupFilter, setLocationGroupsFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string | undefined>();
  const params = useRouteParams(LocationsRoute);

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Schools")} />
        </Grid>
        <Can do={[PermissionEnum.LocationAdd]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={LocationAddRoute.generate(params)}
            >
              {t("Add School")}
            </Button>
            <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.Location}
              label={t("Import schools")}
              className={classes.importButton}
            />
          </Grid>
        </Can>
      </Grid>
      <Section>
        <Filters
          locationGroupFilter={locationGroupFilter}
          setLocationGroupsFilter={setLocationGroupsFilter}
          setSearchText={setSearchText}
          orgId={params.organizationId}
        />
      </Section>
      <LocationsUI
        locationGroupFilter={locationGroupFilter}
        searchText={searchText}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
  importButton: {
    marginLeft: theme.spacing(1),
  },
}));
