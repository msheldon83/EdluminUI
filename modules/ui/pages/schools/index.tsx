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

type Props = {};

export const Locations: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [locationGroupFilter, setLocationGroupsFilter] = useState<number[]>([]);
  const params = useRouteParams(LocationsRoute);

  console.log(locationGroupFilter);

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
        <Grid item>
          <Button
            variant="contained"
            //component={Link}
            //to={ROUTE_GOES_HERE.generate(params)} Generate correct Route for ADD
          >
            {t("Add Permission Set")}
          </Button>
        </Grid>
      </Grid>
      <Section>
        <Filters
          locationGroupFilter={locationGroupFilter}
          setLocationGroupsFilter={setLocationGroupsFilter}
          orgId={params.organizationId}
        />
      </Section>
      <LocationsUI locationGroupFilter={locationGroupFilter} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));
