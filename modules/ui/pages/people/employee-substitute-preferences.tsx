import * as React from "react";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeSubstitutePreferenceRoute } from "ui/routes/people";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeSubPreferencesById } from "./graphql/employee/get-employee-sub-preferences.gen";
import { SaveEmployee } from "./graphql/employee/save-employee.gen";
import { SaveReplacementPoolMember } from "./graphql/employee/save-replacement-pool-member.gen";
import { AddSubPreference } from "./graphql/employee/add-sub-preference.gen";
import { RemoveSubPreference } from "./graphql/employee/remove-sub-preference.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { BlockedPoolMember, PoolMember } from "ui/components/sub-pools/types";
import {
  PermissionEnum,
  ReplacementPoolMemberUpdateInput,
  ReplacementPoolType,
} from "graphql/server-types.gen";
import { PersonLinkHeader } from "ui/components/link-headers/person";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(EmployeeSubstitutePreferenceRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const [favoriteMembers, setFavoriteMembers] = React.useState<PoolMember[]>(
    []
  );
  const [blockedMembers, setBlockedMembers] = React.useState<
    BlockedPoolMember[]
  >([]);

  const getEmployee = useQueryBundle(GetEmployeeSubPreferencesById, {
    variables: { id: params.orgUserId },
    fetchPolicy: "cache-first",
  });

  const orgUser =
    getEmployee.state == "LOADING"
      ? undefined
      : getEmployee.data?.orgUser?.byId;
  const employee = orgUser?.employee ?? undefined;
  React.useEffect(() => {
    setFavoriteMembers(
      compact(
        employee?.substitutePreferences.favoriteSubstituteMembers
      ).map(m => ({ ...m, employee: m.employee ?? undefined }))
    );
    setBlockedMembers(
      compact(employee?.substitutePreferences.blockedSubstituteMembers).map(
        m => ({
          ...m,
          employee: m.employee ?? undefined,
          adminNote: m.adminNote ?? undefined,
        })
      )
    );
  }, [employee]);

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

  const onAddSubstitute = async (sub: PoolMember) => {
    setFavoriteMembers(favoriteMembers.concat(sub));
    await addSub(sub.employeeId, ReplacementPoolType.Favorite);
  };

  const onBlockSubstitute = async (sub: PoolMember) => {
    setBlockedMembers(blockedMembers.concat(sub));
    await addSub(sub.employeeId, ReplacementPoolType.Blocked);
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
    await getEmployee.refetch();
    return true;
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
          orgId: orgUser?.orgId ?? "",
          employee: { id: orgUser?.id },
          substitute: { id: subId },
          replacementPoolType: type,
        },
      },
    });
    if (!result.data) return false;
    await getEmployee.refetch();
    return true;
  };

  const removeSub = async (subId: string, type: ReplacementPoolType) => {
    const result = await removeSubPreference({
      variables: {
        subPreference: {
          orgId: orgUser?.orgId ?? "",
          employee: { id: orgUser?.id },
          substitute: { id: subId },
          replacementPoolType: type,
        },
      },
    });
    if (!result.data) return false;
    await getEmployee.refetch();
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

  if (!orgUser || !employee) {
    return <></>;
  }

  const headerComponent = (
    <PersonLinkHeader
      title={t("Substitute Preferences")}
      person={orgUser}
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
        onAddNote={onAddNote}
        headerComponent={headerComponent}
        orgId={params.organizationId}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        removeBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        removeFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
        addToBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        addToFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
      />
    </>
  );
};
