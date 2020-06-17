import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetSubPreferenceByLocationId } from "./graphql/get-sub-preference-members.gen";
import { UpdateLocation } from "./graphql/update-location.gen";
import { SaveReplacementPoolMember } from "./graphql/save-replacement-pool-member.gen";
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
  ReplacementPoolMemberUpdateInput,
} from "graphql/server-types.gen";
import { LocationLinkHeader } from "ui/components/link-headers/location";

export const LocationSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationSubPrefRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getLocation = useQueryBundle(GetSubPreferenceByLocationId, {
    variables: {
      locationId: params.locationId,
    },
  });

  const onRemoveFavoriteSubstitute = async (sub: ReplacementPoolMember) => {
    const filteredFavorites = location.substitutePreferences?.favoriteSubstituteMembers.filter(
      (u: any) => {
        return u.employeeId !== sub.employeeId;
      }
    );
    return updatePreferences(
      filteredFavorites,
      location.substitutePreferences?.blockedSubstituteMembers,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (sub: ReplacementPoolMember) => {
    const filteredBlocked = location.substitutePreferences?.blockedSubstituteMembers.filter(
      (u: any) => {
        return u.employeeId !== sub.employeeId;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstituteMembers,
      filteredBlocked,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onRemoveAutoAssignedSubstitute = async (sub: ReplacementPoolMember) => {
    const filteredAutoAssigned = location.substitutePreferences?.autoAssignedSubstitutes.filter(
      (u: any) => {
        return u.id !== sub.employeeId;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstituteMembers,
      location.substitutePreferences?.blockedSubstituteMembers,
      filteredAutoAssigned
    );
  };

  const onAddSubstitute = async (sub: ReplacementPoolMember) => {
    location.substitutePreferences?.favoriteSubstituteMembers.push(sub);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstituteMembers,
      location.substitutePreferences?.blockedSubstituteMembers,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onBlockSubstitute = async (sub: ReplacementPoolMember) => {
    location.substitutePreferences?.blockedSubstituteMembers.push(sub);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstituteMembers,
      location.substitutePreferences?.blockedSubstituteMembers,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onAutoAssignSubstitute = async (sub: ReplacementPoolMember) => {
    location.substitutePreferences?.autoAssignedSubstitutes.push({
      id: sub.employeeId,
      firstName: sub.employee?.firstName,
      lastName: sub.employee?.lastName,
    } as OrgUser);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstituteMembers,
      location.substitutePreferences?.blockedSubstituteMembers,
      location.substitutePreferences?.autoAssignedSubstitutes
    );
  };

  const onAddNote = async (
    replacementPoolMember: ReplacementPoolMemberUpdateInput
  ) => {
    const result = await updateReplacementPoolMember({
      variables: {
        replacementPoolMember: replacementPoolMember,
      },
    });
    if (!result?.data) return false;
    await getLocation.refetch();
    return true;
  };

  const [updateReplacementPoolMember] = useMutationBundle(
    SaveReplacementPoolMember,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

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
    await getLocation.refetch();
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

  const autoAssignedMembers =
    location.substitutePreferences.autoAssignedSubstitutes.map(
      (e: any) =>
        ({
          employeeId: e.id,
          employee: { id: e.id, firstName: e.firstName, lastName: e.lastName },
        } as ReplacementPoolMember)
    ) ?? [];

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
        autoAssignMembers={autoAssignedMembers}
        headerComponent={headerComponent}
        useAutoAssign={true}
        onAddNote={onAddNote}
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
