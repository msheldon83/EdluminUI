import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Typography } from "@material-ui/core";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetSubPreferences } from "./graphql/get-sub-preferences.gen";
import { GetLocationGroups } from "./graphql/get-location-groups.gen";
import { compact } from "lodash-es";
import { SchoolGroup } from "./types";
import { EditGroup } from "./edit-group";
import { makeDistricts } from "./helpers";
import { AddOrChangeSubLocationGroupPreference } from "./graphql/add-or-change-sub-location-group-preference.gen";
import { AddOrChangeSubLocationPreference } from "./graphql/add-or-change-sub-location-preference.gen";
import { RemoveSubLocationGroupPreference } from "./graphql/remove-sub-location-group-preference.gen";
import { RemoveSubLocationPreference } from "./graphql/remove-sub-location-preference.gen";
import { PersonalPreference } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  orgName: string;
  orgUserId: string;
  search: string;
  preferences?: { locationId: string; preferenceId: PersonalPreference }[];
  refetchQueries?: string[];
};

export const SubPreferencesEdit: React.FC<Props> = ({
  orgId,
  orgName,
  orgUserId,
  search,
  preferences,
  refetchQueries,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  // Not cache-first, since the preferences might well change on the view page

  const getLocationGroups = useQueryBundle(GetLocationGroups, {
    fetchPolicy: "cache-first",
    variables: { orgId },
    skip: orgId.length == 0,
  });
  const locationGroups =
    getLocationGroups.state === "LOADING"
      ? "LOADING"
      : compact(getLocationGroups.data.locationGroup?.all ?? []).map(g => ({
          ...g,
          locations: compact(g.locations ?? []),
        }));

  const district =
    !preferences || locationGroups === "LOADING"
      ? "LOADING"
      : makeDistricts(
          [{ orgId, orgName, orgUserId }],
          locationGroups,
          preferences
        )[0] ?? "LOADING";

  const filteredGroups =
    district === "LOADING"
      ? "LOADING"
      : search == ""
      ? district.schoolGroups.filter(group => group.schools.length > 0)
      : district.schoolGroups.reduce((acc: SchoolGroup[], group) => {
          const filteredSchools = group.schools.filter(school =>
            school.name.includes(search)
          );
          if (filteredSchools.length) {
            acc.push({ ...group, schools: filteredSchools });
          }
          return acc;
        }, []);

  const [addOrChangeOne] = useMutationBundle(AddOrChangeSubLocationPreference, {
    refetchQueries,
  });
  const [addOrChangeGroup] = useMutationBundle(
    AddOrChangeSubLocationGroupPreference,
    {
      refetchQueries,
    }
  );
  const [removeOne] = useMutationBundle(RemoveSubLocationPreference, {
    refetchQueries,
  });
  const [removeGroup] = useMutationBundle(RemoveSubLocationGroupPreference, {
    refetchQueries,
  });

  const setOne = async (
    locationId: string,
    preference: "favorite" | "hidden"
  ) => {
    const response = await addOrChangeOne({
      variables: {
        orgUserId,
        orgId,
        locationId,
        preferenceId:
          preference == "favorite"
            ? PersonalPreference.Favorite
            : PersonalPreference.Hidden,
      },
    });
  };
  const setGroup = (locationGroupId: string) => async (
    preference: "favorite" | "hidden"
  ) => {
    const response = await addOrChangeGroup({
      variables: {
        orgUserId,
        orgId,
        locationGroupId,
        preferenceId:
          preference == "favorite"
            ? PersonalPreference.Favorite
            : PersonalPreference.Hidden,
      },
    });
  };
  const deleteOne = async (locationId: string) => {
    const response = await removeOne({
      variables: {
        orgUserId,
        orgId,
        locationId,
      },
    });
  };
  const deleteGroup = (locationGroupId: string) => async () => {
    const response = await removeGroup({
      variables: {
        orgUserId,
        orgId,
        locationGroupId,
      },
    });
  };

  return (
    <>
      {orgId.length == 0 ? (
        <Typography className={classes.h2}>
          {t("No district selected")}
        </Typography>
      ) : filteredGroups === "LOADING" ? (
        <Typography className={classes.h2}>{t("Loading...")}</Typography>
      ) : (
        filteredGroups.map(group => (
          <EditGroup
            key={group.id}
            group={group}
            onSet={setOne}
            onSetAll={setGroup(group.id)}
            onDelete={deleteOne}
            onDeleteAll={deleteGroup(group.id)}
          />
        ))
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  h2: {
    //fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(24),
  },
}));
