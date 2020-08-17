import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { compact } from "lodash-es";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { OrgInfo } from "ui/components/substitutes/preferences/types";
import { ViewGroup } from "../../../pages/sub-preferences/components/view-group";
import { RemoveSubLocationGroupPreference } from "ui/components/substitutes/preferences/graphql/remove-sub-location-group-preference.gen";
import { RemoveSubLocationPreference } from "ui/components/substitutes/preferences/graphql/remove-sub-location-preference.gen";
import { GetSubPreferences } from "ui/components/substitutes/preferences/graphql/get-sub-preferences.gen";
import { GetLocationGroups } from "ui/components/substitutes/preferences/graphql/get-location-groups.gen";
import {
  makeDistricts,
  groupDistricts,
} from "ui/components/substitutes/preferences/helpers";
import clsx from "clsx";

type Props = {
  userId: string;
  orgInfo: OrgInfo[];
};

export const SubPreferences: React.FC<Props> = ({ userId, orgInfo }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  // Not cache-first, since the preferences might well change on the edit page
  const getPreferences = useQueryBundle(GetSubPreferences, {
    variables: { userId },
    skip: orgInfo.length == 0,
  });
  const preferences =
    getPreferences.state === "LOADING"
      ? "LOADING"
      : compact(
          getPreferences.data.orgUser?.substituteLocationPreferences ?? []
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

  const groups = React.useMemo(
    () =>
      preferences === "LOADING" || locationGroups === "LOADING"
        ? "LOADING"
        : groupDistricts(makeDistricts(orgInfo, locationGroups, preferences)),
    [preferences, locationGroups, orgInfo]
  );
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
    <Grid container spacing={2}>
      {preferences.length == 0 ? (
        <Typography className={classes.h2}>
          {t("No preferences set")}
        </Typography>
      ) : groups === "LOADING" ? (
        <Typography className={classes.h2}>{t("Loading...")}</Typography>
      ) : (
        <>
          <Grid item container xs={isMobile ? 12 : 6} direction="column">
            <Typography className={classes.h2}>
              {groups.favorites.length == 0
                ? t("No Favorite Schools")
                : t("Favorites")}
            </Typography>
            {groups.favorites.length > 0 &&
              groups.favorites.map(d => (
                <React.Fragment key={d.id}>
                  <Typography
                    className={clsx(classes.districtName, classes.h5)}
                  >
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
          <Grid item container xs={isMobile ? 12 : 6} direction="column">
            <Typography className={classes.h2}>
              {groups.hidden.length == 0 ? t("No Hidden Schools") : t("Hidden")}
            </Typography>
            {groups.hidden.length > 0 &&
              groups.hidden.map(d => (
                <React.Fragment key={d.id}>
                  <Typography
                    className={clsx(classes.districtName, classes.h5)}
                  >
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
  h2: {
    //fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(24),
  },
  h5: {
    //fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
  },
  districtName: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    "&:first-child": {
      paddingTop: theme.spacing(3),
    },
  },
}));
