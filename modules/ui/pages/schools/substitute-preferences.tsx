import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { UpdateLocation } from "./graphql/update-location.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationSubPrefRoute } from "ui/routes/locations";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { PermissionEnum, OrgUser } from "graphql/server-types.gen";

export const LocationSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationSubPrefRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
  });

  const onRemoveFavoriteSubstitute = async (substitute: OrgUser) => {
    const filteredFavorites = location.substitutePreferences?.favoriteSubstitutes.filter(
      (u: OrgUser) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      filteredFavorites,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (substitute: OrgUser) => {
    const filteredBlocked = location.substitutePreferences?.blockedSubstitutes.filter(
      (u: OrgUser) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      filteredBlocked,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onRemoveAutoAssignedSubstitute = async (substitute: OrgUser) => {
    const filteredAutoAssigned = location.substitutePreferences?.autoAssignedSubstitutes.filter(
      (u: OrgUser) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      filteredAutoAssigned
    );
  };

  const onAddSubstitute = async (substitute: OrgUser) => {
    location.substitutePreferences?.favoriteSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onBlockSubstitute = async (substitute: OrgUser) => {
    location.substitutePreferences?.blockedSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onAutoAssignSubstitute = async (substitute: OrgUser) => {
    location.substitutePreferences?.autoAssignedSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const updatePreferences = async (
    favorites: OrgUser[],
    blocked: OrgUser[],
    autoAssigned: OrgUser[]
  ) => {
    const neweFavs = favorites.map((s: OrgUser) => {
      return { id: s.id };
    });

    const neweBlocked = blocked.map((s: OrgUser) => {
      return { id: s.id };
    });

    const neweAutoAssigned = autoAssigned.map((s: OrgUser) => {
      return { id: s.id };
    });

    const updatedLocation: any = {
      id: location.id,
      rowVersion: location.rowVersion,
      substitutePreferences: {
        favoriteSubstitutes: neweFavs,
        blockedSubstitutes: neweBlocked,
        autoAssignedSubstitutes: neweAutoAssigned,
      },
    };
    const result = await updateLocation({
      variables: {
        location: updatedLocation,
      },
    });
    if (!result?.data) return false;
    return true;
  };

  const [updateLocation] = useMutationBundle(UpdateLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (getLocation.state === "LOADING") {
    return <></>;
  }
  const location: any = getLocation?.data?.location?.byId ?? undefined;
  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        autoAssignHeading={t("Auto Assign")}
        searchHeading={"All Substitutes"}
        favoriteEmployees={location.substitutePreferences.favoriteSubstitutes}
        blockedEmployees={location.substitutePreferences.blockedSubstitutes}
        autoAssignEmployees={
          location.substitutePreferences.autoAssignedSubstitutes
        }
        heading={t("Substitute Preferences")}
        subHeading={location.name}
        isLocationOnly={true}
        orgId={params.organizationId}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onRemoveAutoAssignedEmployee={onRemoveAutoAssignedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        onAutoAssignEmployee={onAutoAssignSubstitute}
        removeBlockedPermission={[PermissionEnum.LocationSave]}
        removeFavoritePermission={[PermissionEnum.LocationSave]}
        addToBlockedPermission={[PermissionEnum.LocationSave]}
        addToFavoritePermission={[PermissionEnum.LocationSave]}
      />
    </>
  );
};
