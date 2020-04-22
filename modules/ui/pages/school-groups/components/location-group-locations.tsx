import * as React from "react";
import { Location } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Typography, Grid } from "@material-ui/core";
import { SectionHeader } from "ui/components/section-header";
import { LocationLink } from "ui/components/links/locations";

type Props = { locations: Location[] };

export const LocationGroupLocations: React.FC<Props> = props => {
  const { t } = useTranslation();
  const locations = props.locations;
  return (
    <Section>
      <SectionHeader title={t("Schools")} />

      <Grid container spacing={2}>
        <Grid container item spacing={2} xs={5}>
          {locations && (
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Schools")}</Typography>
              {locations.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                locations.map((n, i) => (
                  <div key={i}>
                    <LocationLink orgId={n.orgId} locationId={n.id} />
                  </div>
                ))
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Section>
  );
};
