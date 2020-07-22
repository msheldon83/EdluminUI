import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { compact } from "lodash-es";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { OrgInfo } from "./types";
import { ViewGroup } from "./components/groups";
import { RemoveSubLocationGroupPreference } from "./graphql/remove-sub-location-group-preference.gen";
import { RemoveSubLocationPreference } from "./graphql/remove-sub-location-preference.gen";
import { GetSubPreferences } from "./graphql/get-sub-preferences.gen";
import { GetLocationGroups } from "./graphql/get-location-groups.gen";
import { makeDistricts, groupDistricts } from "./helpers";

type Props = {
  userId: string;
  orgInfo: OrgInfo[];
};

export const SubPreferencesUI: React.FC<Props> = ({ userId, orgInfo }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const getPreferences = useQueryBundle(GetSubPreferences, {
    fetchPolicy: "cache-first",
    variables: { userId },
    skip: orgInfo.length == 0,
  });
  const preferences =
    getPreferences.state === "LOADING"
      ? "LOADING"
      : compact(
          getPreferences.data.employee?.employeeLocationPreferences ?? []
        );

  const getLocationGroups = useQueryBundle(GetLocationGroups, {
    fetchPolicy: "cache-first",
    variables: { orgIds: orgInfo.map(o => o.orgId) },
    skip: orgInfo.length == 0 || preferences.length == 0,
  });
  const locationGroups =
    getLocationGroups.state === "LOADING"
      ? "LOADING"
      : compact(getLocationGroups.data.locationGroup?.all ?? []).map(g => ({
          ...g,
          locations: compact(g.locations ?? []),
        }));

  const groups =
    preferences === "LOADING" || locationGroups === "LOADING"
      ? "LOADING"
      : groupDistricts(makeDistricts(orgInfo, locationGroups, preferences));
  const [removeOne] = useMutationBundle(RemoveSubLocationPreference, {
    refetchQueries: ["GetSubPreferences"],
  });
  const [removeGroup] = useMutationBundle(RemoveSubLocationGroupPreference, {
    refetchQueries: ["GetSubPreferences"],
  });

  const deleteOne = (orgUserId: string, orgId: string) => async (
    locationId: string
  ) => {
    const response = await removeOne({
      variables: {
        orgUserId,
        orgId,
        locationId,
      },
    });
  };
  const deleteGroup = (
    orgUserId: string,
    orgId: string,
    locationGroupId: string
  ) => async () => {
    const response = await removeGroup({
      variables: {
        orgUserId,
        orgId,
        locationGroupId,
      },
    });
  };

  return (
    <Grid container>
      {preferences.length == 0 ? (
        <Typography variant="h4">{t("No preferences set")}</Typography>
      ) : groups === "LOADING" ? (
        <Typography variant="h4">{t("Loading...")}</Typography>
      ) : (
        <>
          <Grid
            item
            container
            xs={isMobile ? 12 : 6}
            direction="column"
            className={classes.column}
          >
            <Typography variant="h4">
              {groups.favorites.length == 0
                ? t("No Favorite Schools")
                : t("Favorites")}
            </Typography>
            {groups.favorites.length > 0 &&
              groups.favorites.map(d => (
                <React.Fragment key={d.id}>
                  <Typography variant="h5" className={classes.districtName}>
                    {d.name}
                  </Typography>
                  {d.schoolGroups.map(g => (
                    <ViewGroup
                      key={g.id}
                      group={g}
                      allActionName={t("Remove all")}
                      actionName={t("Remove")}
                      setGroupToDefault={deleteGroup(d.orgUserId, d.id, g.id)}
                      setSchoolToDefault={deleteOne(d.orgUserId, d.id)}
                    />
                  ))}
                </React.Fragment>
              ))}
          </Grid>
          <Grid
            item
            container
            xs={isMobile ? 12 : 6}
            direction="column"
            className={classes.column}
          >
            <Typography variant="h4">
              {groups.hidden.length == 0 ? t("No Hidden Schools") : t("Hidden")}
            </Typography>
            {groups.hidden.length > 0 &&
              groups.hidden.map(d => (
                <React.Fragment key={d.id}>
                  <Typography variant="h5" className={classes.districtName}>
                    {d.name}
                  </Typography>
                  {d.schoolGroups.map(g => (
                    <ViewGroup
                      key={g.id}
                      group={g}
                      allActionName={t("Unhide all")}
                      actionName={t("Unhide")}
                      setGroupToDefault={deleteGroup(d.orgUserId, d.id, g.id)}
                      setSchoolToDefault={deleteOne(d.orgUserId, d.id)}
                    />
                  ))}
                </React.Fragment>
              ))}
          </Grid>
        </>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  districtName: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    "&:first-child": {
      paddingTop: theme.spacing(3),
    },
  },
  column: {
    padding: theme.spacing(3),
  },
}));
