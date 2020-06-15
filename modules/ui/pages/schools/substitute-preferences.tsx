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
import {
  PermissionEnum,
  OrgUser,
  ReplacementPoolMember,
} from "graphql/server-types.gen";
import { LocationLinkHeader } from "ui/components/link-headers/location";

export const LocationSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationSubPrefRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
  });

  const onRemoveFavoriteSubstitute = async (
    substitute: ReplacementPoolMember
  ) => {
    const filteredFavorites = location.substitutePreferences?.favoriteSubstitutes.filter(
      (u: OrgUser) => {
        return u.id !== substitute.employeeId;
      }
    );
    return updatePreferences(
      filteredFavorites,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (
    substitute: ReplacementPoolMember
  ) => {
    const filteredBlocked = location.substitutePreferences?.blockedSubstitutes.filter(
      (u: OrgUser) => {
        return u.id !== substitute.employeeId;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      filteredBlocked,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onRemoveAutoAssignedSubstitute = async (
    substitute: ReplacementPoolMember
  ) => {
    const filteredAutoAssigned = location.substitutePreferences?.autoAssignedSubstitutes.filter(
      (u: OrgUser) => {
        return u.id !== substitute.employeeId;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      filteredAutoAssigned
    );
  };

  const onAddSubstitute = async (substitute: ReplacementPoolMember) => {
    location.substitutePreferences?.favoriteSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onBlockSubstitute = async (substitute: ReplacementPoolMember) => {
    location.substitutePreferences?.blockedSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onAutoAssignSubstitute = async (substitute: ReplacementPoolMember) => {
    location.substitutePreferences?.autoAssignedSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const updatePreferences = async (
    favorites: ReplacementPoolMember[],
    blocked: ReplacementPoolMember[],
    autoAssigned: OrgUser[]
  ) => {
    const neweFavs = favorites.map((s: ReplacementPoolMember) => {
      return { id: s.employeeId };
    });

    const neweBlocked = blocked.map((s: ReplacementPoolMember) => {
      return { id: s.employeeId };
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

  const headerComponent = (
    <LocationLinkHeader
      title={t("Substitute Preferences")}
      locationName={location.name as string}
      params={params}
    />
  );

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        autoAssignHeading={t("Auto Assign")}
        searchHeading={"All Substitutes"}
        favoriteMembers={
          location.substitutePreferences.favoriteSubstituteMembers ?? []
        }
        blockedMembers={
          location.substitutePreferences.blockedSubstituteMembers ?? []
        }
        autoAssignMembers={
          location.substitutePreferences.autoAssignedSubstitutes ?? []
        }
        headerComponent={headerComponent}
        useAutoAssign={true}
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
