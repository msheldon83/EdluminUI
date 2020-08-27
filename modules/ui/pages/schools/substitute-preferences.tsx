import * as React from "react";
import { compact } from "lodash-es";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetSubPreferenceByLocationId } from "./graphql/get-sub-preference-members.gen";
import { SaveReplacementPoolMember } from "./graphql/save-replacement-pool-member.gen";
import { AddSubPreference } from "./graphql/add-sub-preference.gen";
import { RemoveSubPreference } from "./graphql/remove-sub-preference.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationSubPrefRoute } from "ui/routes/locations";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { BlockedPoolMember, PoolMember } from "ui/components/sub-pools/types";
import {
  PermissionEnum,
  ReplacementPoolMemberUpdateInput,
  ReplacementPoolType,
} from "graphql/server-types.gen";
import { LocationLinkHeader } from "ui/components/link-headers/location";

export const LocationSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationSubPrefRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const [favoriteMembers, setFavoriteMembers] = React.useState<PoolMember[]>(
    []
  );
  const [blockedMembers, setBlockedMembers] = React.useState<
    BlockedPoolMember[]
  >([]);
  const [autoAssignedMembers, setAutoAssignedMembers] = React.useState<
    PoolMember[]
  >([]);

  const getLocation = useQueryBundle(GetSubPreferenceByLocationId, {
    variables: {
      locationId: params.locationId,
    },
  });

  const location =
    getLocation.state == "LOADING"
      ? undefined
      : getLocation.data.location?.byId;

  React.useEffect(() => {
    setFavoriteMembers(
      compact(
        location?.substitutePreferences.favoriteSubstituteMembers
      ).map(m => ({ ...m, employee: m.employee ?? undefined }))
    );
    setBlockedMembers(
      compact(location?.substitutePreferences.blockedSubstituteMembers).map(
        m => ({
          ...m,
          employee: m.employee ?? undefined,
          adminNote: m.adminNote ?? undefined,
        })
      )
    );
    setAutoAssignedMembers(
      compact(
        location?.substitutePreferences.autoAssignedSubstitutes
      ).map(m => ({ employeeId: m.id, employee: m }))
    );
  }, [location]);

  const onRemoveFavoriteSubstitute = async (sub: PoolMember) => {
    setFavoriteMembers(
      favoriteMembers.filter(m => m.employeeId != sub.employeeId)
    );
    await removeSub(sub.employeeId, ReplacementPoolType.Favorite);
  };

  const onRemoveBlockedSubstitute = async (sub: BlockedPoolMember) => {
    setBlockedMembers(
      blockedMembers.filter(m => m.employeeId != sub.employeeId)
    );
    await removeSub(sub.employeeId, ReplacementPoolType.Blocked);
  };

  const onRemoveAutoAssignedSubstitute = async (sub: BlockedPoolMember) => {
    setAutoAssignedMembers(
      autoAssignedMembers.filter(m => m.employeeId != sub.employeeId)
    );
    await removeSub(sub.employeeId, ReplacementPoolType.AutoAssign);
  };

  const onAddSubstitute = async (sub: PoolMember) => {
    setFavoriteMembers(favoriteMembers.concat(sub));
    await addSub(sub.employeeId, ReplacementPoolType.Favorite);
  };

  const onBlockSubstitute = async (sub: PoolMember) => {
    setBlockedMembers(blockedMembers.concat(sub));
    await addSub(sub.employeeId, ReplacementPoolType.Blocked);
  };

  const onAutoAssignSubstitute = async (sub: PoolMember) => {
    setAutoAssignedMembers(autoAssignedMembers.concat(sub));
    await addSub(sub.employeeId, ReplacementPoolType.AutoAssign);
  };

  const [addSubPreference] = useMutationBundle(AddSubPreference, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [removeSubPreference] = useMutationBundle(RemoveSubPreference, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const addSub = async (subId: string, type: ReplacementPoolType) => {
    const result = await addSubPreference({
      variables: {
        subPreference: {
          orgId: params.organizationId,
          location: { id: location?.id },
          substitute: { id: subId },
          replacementPoolType: type,
        },
      },
    });
    if (!result.data) return false;
    await getLocation.refetch();
    return true;
  };

  const removeSub = async (subId: string, type: ReplacementPoolType) => {
    const result = await removeSubPreference({
      variables: {
        subPreference: {
          orgId: params.organizationId,
          location: { id: location?.id },
          substitute: { id: subId },
          replacementPoolType: type,
        },
      },
    });
    if (!result.data) return false;
    await getLocation.refetch();
    return true;
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

  if (!location) {
    return <></>;
  }

  const headerComponent = (
    <LocationLinkHeader
      title={t("Substitute Preferences")}
      locationName={location.name}
      params={params}
    />
  );

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteMembers={favoriteMembers}
        blockedMembers={blockedMembers}
        headerComponent={headerComponent}
        onAddNote={onAddNote}
        orgId={params.organizationId}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        removeBlockedPermission={[PermissionEnum.LocationSaveBlockedSubs]}
        removeFavoritePermission={[PermissionEnum.LocationSaveFavoriteSubs]}
        addToBlockedPermission={[PermissionEnum.LocationSaveBlockedSubs]}
        addToFavoritePermission={[PermissionEnum.LocationSaveFavoriteSubs]}
        autoAssign={{
          heading: t("Auto Assign"),
          members: autoAssignedMembers,
          onAdd: onAutoAssignSubstitute,
          addPermission: [PermissionEnum.LocationSaveAutoAssignSubs],
          onRemove: onRemoveAutoAssignedSubstitute,
          removePermission: [PermissionEnum.LocationSaveAutoAssignSubs],
        }}
      />
    </>
  );
};
