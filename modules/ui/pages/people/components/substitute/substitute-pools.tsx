import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { compact } from "lodash-es";
import {
  Maybe,
  Employee,
  Location,
  LocationGroup,
  PositionType,
  PermissionEnum,
} from "graphql/server-types.gen";
import { PeopleSubPoolEditRoute, PersonViewRoute } from "ui/routes/people";

type Props = {
  editing: string | null;
  substitutePoolMembership?: Maybe<{
    blockedFromEmployees?:
      | Maybe<Pick<Employee, "firstName" | "lastName">>[]
      | null;
    favoriteForEmployees?:
      | Maybe<Pick<Employee, "firstName" | "lastName">>[]
      | null;
    blockedFromPositionTypes?: Maybe<Pick<PositionType, "name">>[] | null;
    favoriteForPositionTypes?: Maybe<Pick<PositionType, "name">>[] | null;
    blockedFromLocationGroups?: Maybe<Pick<LocationGroup, "name">>[] | null;
    favoriteForLocationGroups?: Maybe<Pick<LocationGroup, "name">>[] | null;
    blockedFromLocations?: Maybe<Pick<Location, "name">>[] | null;
    favoriteForLocations?: Maybe<Pick<Location, "name">>[] | null;
  }> | null;
};

export const SubstitutePools: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(PersonViewRoute);
  const substitutePoolMembership = props.substitutePoolMembership;

  const blockedLocationsList =
    compact(
      substitutePoolMembership?.blockedFromLocations?.map(l => l?.name)
    ) ?? [];
  const favoriteLocationsList =
    compact(
      substitutePoolMembership?.favoriteForLocations?.map(l => l?.name)
    ) ?? [];
  const blockedLocationGroupsList =
    compact(
      substitutePoolMembership?.blockedFromLocationGroups?.map(
        lg => `${lg?.name} (Group)`
      )
    ) ?? [];
  const favoriteLocationGroupsList =
    compact(
      substitutePoolMembership?.favoriteForLocationGroups?.map(
        lg => `${lg?.name} (Group)`
      )
    ) ?? [];
  const combinedBlockedLocationsList = blockedLocationGroupsList.concat(
    blockedLocationsList
  );
  const combinedFavoriteLocationsList = favoriteLocationGroupsList.concat(
    favoriteLocationsList
  );

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Substitute pools")}
          action={{
            text: t("Edit"),
            visible: false,
            execute: () => {
              const editSettingsUrl = PeopleSubPoolEditRoute.generate(params);
              history.push(editSettingsUrl);
            },
            permissions: [PermissionEnum.SubstituteSave],
          }}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12}>
              <Typography className={classes.heading}>
                {t("Favorite for")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Employees")}</Typography>
              {substitutePoolMembership?.favoriteForEmployees?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                substitutePoolMembership?.favoriteForEmployees?.map((n, i) => (
                  <div key={i}>{`${n?.firstName} ${n?.lastName}`}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Position Types")}</Typography>
              {substitutePoolMembership?.favoriteForPositionTypes?.length ===
              0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                substitutePoolMembership?.favoriteForPositionTypes?.map(
                  (n, i) => <div key={i}>{n?.name}</div>
                )
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Locations")}</Typography>
              {combinedFavoriteLocationsList.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                combinedFavoriteLocationsList.map((name, i) => (
                  <div key={i}>{name}</div>
                ))
              )}
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12}>
              <Typography className={classes.heading}>
                {t("Blocked by")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Employees")}</Typography>
              {substitutePoolMembership?.blockedFromEmployees?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                substitutePoolMembership?.blockedFromEmployees?.map((n, i) => (
                  <div key={i}>{`${n?.firstName} ${n?.lastName}`}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Position Types")}</Typography>
              {substitutePoolMembership?.blockedFromPositionTypes?.length ===
              0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                substitutePoolMembership?.blockedFromPositionTypes?.map(
                  (n, i) => <div key={i}>{n?.name}</div>
                )
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Locations")}</Typography>
              {combinedBlockedLocationsList.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                combinedBlockedLocationsList.map((name, i) => (
                  <div key={i}>{name}</div>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    letterSpacing: theme.typography.pxToRem(0.15),
    color: theme.customColors.blue,
  },
}));
