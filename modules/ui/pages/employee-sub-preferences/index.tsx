import * as React from "react";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeByIdForPreferences } from "./graphql/get-employee-by-id.gen";
import { AddSubPreference } from "./graphql/add-sub-preference.gen";
import { RemoveSubPreference } from "./graphql/remove-sub-preference.gen";
import { SaveReplacementPoolMember } from "./graphql/save-replacement-pool-member.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { BlockedPoolMember, PoolMember } from "ui/components/sub-pools/types";
import {
  PermissionEnum,
  ReplacementPoolType,
  ReplacementPoolMemberUpdateInput,
} from "graphql/server-types.gen";
import { useGetEmployee } from "reference-data/employee";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const me = useGetEmployee();

  const [favoriteMembers, setFavoriteMembers] = React.useState<PoolMember[]>(
    []
  );
  const [blockedMembers, setBlockedMembers] = React.useState<
    BlockedPoolMember[]
  >([]);

  const getEmployee = useQueryBundle(GetEmployeeByIdForPreferences, {
    variables: { id: me?.id },
  });

  const orgUser =
    getEmployee.state == "LOADING"
      ? undefined
      : getEmployee.data?.orgUser?.byId;
  const employee = orgUser?.employee;
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

  const [updateReplacementPoolMember] = useMutationBundle(
    SaveReplacementPoolMember,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const [addSubPreference] = useMutationBundle(AddSubPreference, {
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

  const [removeSubPreference] = useMutationBundle(RemoveSubPreference, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (!orgUser || !employee) {
    return <></>;
  }

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteMembers={favoriteMembers}
        blockedMembers={blockedMembers}
        heading={t("Substitute Preferences")}
        orgId={orgUser?.orgId ?? ""}
        onAddNote={onAddNote}
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
