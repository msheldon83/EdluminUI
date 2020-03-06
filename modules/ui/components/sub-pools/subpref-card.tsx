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
  Location,
} from "graphql/server-types.gen";

type Props = {
  heading: string;
  blockedSubstitutes: Pick<Employee, "id" | "firstName" | "lastName">[];
  favoriteSubstitutes: Pick<Employee, "id" | "firstName" | "lastName">[];
  autoAssignedSubstitutes?: Pick<Employee, "id" | "firstName" | "lastName">[];
  autoAssignedLocations?: Pick<Location, "id" | "name">[];
  autoAssignedSubsOnly?: boolean;
  showAutoAssignedLocations?: boolean;
  editRoute: string;
  editing: boolean;
  editPermission: PermissionEnum[];
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

  const autoAssignedEmployees = props.autoAssignedSubstitutes
    ? props.autoAssignedSubstitutes
    : [];

  const autoAssignedLocations = props.autoAssignedLocations
    ? props.autoAssignedLocations
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
            permissions: props.editPermission,
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
                  favoriteEmployees.map((n, i) => (
                    <div key={i}>{n.firstName + " " + n.lastName}</div>
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
                  blockedEmployees.map((n, i) => (
                    <div key={i}>{n.firstName + " " + n.lastName}</div>
                  ))
                )}
              </Grid>
            )}
          </Grid>
          {props.autoAssignedSubsOnly && (
            <Grid container item spacing={2} xs={5}>
              {autoAssignedEmployees && (
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">{t("Auto Assigned")}</Typography>
                  {autoAssignedEmployees.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    autoAssignedEmployees.map((n, i) => (
                      <div key={i}>{n.firstName + " " + n.lastName}</div>
                    ))
                  )}
                </Grid>
              )}
            </Grid>
          )}
          {props.showAutoAssignedLocations && autoAssignedLocations.length > 0 && (
            <Grid container item spacing={2} xs={5}>
              {autoAssignedLocations && (
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">{t("Auto Assigned")}</Typography>
                  {autoAssignedLocations.map((n, i) => (
                    <div key={i}>{n.name}</div>
                  ))}
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Section>
    </>
  );
};
