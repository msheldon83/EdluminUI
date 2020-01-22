import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  Maybe,
  Employee,
  PermissionEnum,
  SubstitutePreferences,
} from "graphql/server-types.gen";

import { useRouteParams } from "ui/routes/definition";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  heading: string;
  preferredLists?: SubstitutePreferences | null;
  editRoute: string;
};

export const SubstitutePrefCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const favoriteSubstitutes = props.preferredLists?.favoriteSubstitutes;
  const blockedSubstitutes = props.preferredLists?.blockedSubstitutes;

  return (
    <>
      <Section>
        <SectionHeader
          title={t(props.heading)}
          action={{
            text: t("Edit"),
            visible: true,
            execute: () => {
              history.push(props.editRoute);
            },
            permissions: [PermissionEnum.LocationSave],
          }}
        />

        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={4}>
            {favoriteSubstitutes && (
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Favorites")}</Typography>
                {favoriteSubstitutes.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  favoriteSubstitutes.map((n, i) => (
                    <div key={i}>{n?.firstName + " " + n?.lastName}</div>
                  ))
                )}
              </Grid>
            )}
          </Grid>
          <Grid container item spacing={2} xs={4}>
            {blockedSubstitutes && (
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Blocked")}</Typography>
                {blockedSubstitutes.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  blockedSubstitutes.map((n, i) => (
                    <div key={i}>{n?.firstName + " " + n?.lastName}</div>
                  ))
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
