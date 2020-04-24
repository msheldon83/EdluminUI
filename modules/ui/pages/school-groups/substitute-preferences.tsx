import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetLocationGroupById } from "./graphql/get-location-group-by-id.gen";
import { UpdateLocationGroup } from "./graphql/update-location-group.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationGroupSubPrefRoute } from "ui/routes/location-groups";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { PermissionEnum } from "graphql/server-types.gen";

export const LocationGroupSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationGroupSubPrefRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getLocationGroup = useQueryBundle(GetLocationGroupById, {
    variables: {
      locationGroupId: params.locationGroupId,
    },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (substitute: any) => {
    const filteredFavorites = locationGroup.substitutePreferences?.favoriteSubstitutes.filter(
      (u: any) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      filteredFavorites,
      locationGroup.substitutePreferences?.blockedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (substitute: any) => {
    const filteredBlocked = locationGroup.substitutePreferences?.blockedSubstitutes.filter(
      (u: any) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      locationGroup.substitutePreferences?.favoriteSubstitutes,
      filteredBlocked
    );
  };

  const onAddSubstitute = async (substitute: any) => {
    locationGroup.substitutePreferences?.favoriteSubstitutes.push(substitute);

    return updatePreferences(
      locationGroup.substitutePreferences?.favoriteSubstitutes,
      locationGroup.substitutePreferences?.blockedSubstitutes
    );
  };

  const onBlockSubstitute = async (substitute: any) => {
    locationGroup.substitutePreferences?.blockedSubstitutes.push(substitute);

    return updatePreferences(
      locationGroup.substitutePreferences?.favoriteSubstitutes,
      locationGroup.substitutePreferences?.blockedSubstitutes
    );
  };

  const updatePreferences = async (favorites: any[], blocked: any[]) => {
    const neweFavs = favorites.map((s: any) => {
      return { id: s.id };
    });

    const neweBlocked = blocked.map((s: any) => {
      return { id: s.id };
    });
    const updatedLocationGroup: any = {
      id: locationGroup.id,
      rowVersion: locationGroup.rowVersion,
      substitutePreferences: {
        favoriteSubstitutes: neweFavs,
        blockedSubstitutes: neweBlocked,
      },
    };
    const result = await updateLocationGroup({
      variables: {
        locationGroup: updatedLocationGroup,
      },
    });
    if (!result?.data) return false;
    await getLocationGroup.refetch();
    return true;
  };

  const [updateLocationGroup] = useMutationBundle(UpdateLocationGroup, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (getLocationGroup.state === "LOADING") {
    return <></>;
  }
  const locationGroup: any =
    getLocationGroup?.data?.locationGroup?.byId ?? undefined;
  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteEmployees={
          locationGroup.substitutePreferences.favoriteSubstitutes
        }
        blockedEmployees={
          locationGroup.substitutePreferences.blockedSubstitutes
        }
        heading={t("Substitute Preferences")}
        subHeading={locationGroup.name}
        orgId={params.organizationId}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        isLocationOnly={false}
        removeBlockedPermission={[PermissionEnum.LocationGroupSave]}
        removeFavoritePermission={[PermissionEnum.LocationGroupSave]}
        addToBlockedPermission={[PermissionEnum.LocationGroupSave]}
        addToFavoritePermission={[PermissionEnum.LocationGroupSave]}
      ></SubstitutePreferences>
    </>
  );
};
