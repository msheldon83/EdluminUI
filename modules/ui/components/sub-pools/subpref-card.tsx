import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Maybe, Employee, PermissionEnum } from "graphql/server-types.gen";

import { useRouteParams } from "ui/routes/definition";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  heading: string;
  preferredLists?: any | null;
  blockedSubstitutes?: any[] | null;
  favoriteSubstitutes?: any[] | null;
  editRoute: string;
  editing: boolean;
};

export const SubstitutePrefCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const favoriteEmployees = props.favoriteSubstitutes
    ? props.favoriteSubstitutes
    : [];
  const blockedEmployees = props.blockedSubstitutes
    ? props.blockedSubstitutes
    : [];

  return (
    <>
      <Section>
        <SectionHeader
          title={t(props.heading)}
          action={{
            text: t("Edit"),
            visible: !props.editing,
            execute: () => {
              history.push(props.editRoute);
            },
            permissions: [PermissionEnum.LocationSave],
          }}
        />

        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={5}>
            {favoriteEmployees && (
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Favorites")}</Typography>
                {favoriteEmployees.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  favoriteEmployees.map((n: Employee, i: number) => (
                    <div key={i}>{n?.firstName + " " + n?.lastName}</div>
                  ))
                )}
              </Grid>
            )}
          </Grid>
          <Grid container item spacing={2} xs={5}>
            {blockedEmployees && (
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Blocked")}</Typography>
                {blockedEmployees.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  blockedEmployees.map((n: Employee, i: number) => (
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
