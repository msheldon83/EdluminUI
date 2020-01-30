import * as React from "react";
import { useTranslation } from "react-i18next";
import { Filters } from "./components/filters";
import { Section } from "ui/components/section";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { LocationsRoute } from "ui/routes/locations";
import { useRouteParams } from "ui/routes/definition";
import { LocationsUI } from "./ui";
import { useState } from "react";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

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
        <PageTitle title={t("Schools")} />
        <Can do={[PermissionEnum.LocationSave]}>
          <Grid item>
            <Button
              variant="contained"
              //component={Link}
              //to={ROUTE_GOES_HERE.generate(params)} Generate correct Route for ADD
            >
              {t("Add School")}
            </Button>
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
}));
