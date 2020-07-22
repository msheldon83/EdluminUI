import * as React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetSubPreferences } from "./graphql/get-sub-preferences.gen";
import { GetLocationGroups } from "./graphql/get-location-groups.gen";
import { compact } from "lodash-es";
import { SchoolGroup } from "./types";
import { EditGroup } from "./components/groups";
import { makeDistricts } from "./helpers";
import { AddOrChangeSubLocationGroupPreference } from "./graphql/add-or-change-sub-location-group-preference.gen";
import { AddOrChangeSubLocationPreference } from "./graphql/add-or-change-sub-location-preference.gen";
import { RemoveSubLocationGroupPreference } from "./graphql/remove-sub-location-group-preference.gen";
import { RemoveSubLocationPreference } from "./graphql/remove-sub-location-preference.gen";
import { PersonalPreference } from "graphql/server-types.gen";

type Props = {
  userId: string;
  orgId: string;
  orgName: string;
  orgUserId: string;
  search: string;
};

export const SubPreferencesEditUI: React.FC<Props> = ({
  userId,
  orgId,
  orgName,
  orgUserId,
  search,
}) => {
  const { t } = useTranslation();
  // Not cache-first, since the preferences might well change on the view page
  const getPreferences = useQueryBundle(GetSubPreferences, {
    variables: { userId, orgId },
    skip: orgId.length == 0,
  });
  const preferences =
    getPreferences.state === "LOADING"
      ? "LOADING"
      : compact(
          getPreferences.data.orgUser?.substituteLocationPreferences ?? []
        );

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
    preferences === "LOADING" || locationGroups === "LOADING"
      ? "LOADING"
      : makeDistricts(
          [{ orgId, orgName, orgUserId }],
          locationGroups,
          preferences
        )[0];

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
    refetchQueries: ["GetSubPreferences"],
  });
  const [addOrChangeGroup] = useMutationBundle(
    AddOrChangeSubLocationGroupPreference,
    {
      refetchQueries: ["GetSubPreferences"],
    }
  );
  const [removeOne] = useMutationBundle(RemoveSubLocationPreference, {
    refetchQueries: ["GetSubPreferences"],
  });
  const [removeGroup] = useMutationBundle(RemoveSubLocationGroupPreference, {
    refetchQueries: ["GetSubPreferences"],
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
        <Typography variant="h4">{t("No district selected")}</Typography>
      ) : filteredGroups === "LOADING" ? (
        <Typography variant="h4">{t("Loading...")}</Typography>
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
