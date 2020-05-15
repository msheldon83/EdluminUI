import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeByIdForPreferences } from "./graphql/get-employee-by-id.gen";
import { AddSubPreference } from "./graphql/add-sub-preference.gen";
import { RemoveSubPreference } from "./graphql/remove-sub-preference.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { PermissionEnum, ReplacementPoolType } from "graphql/server-types.gen";
import { useGetEmployee } from "reference-data/employee";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const me = useGetEmployee();

  const getEmployee = useQueryBundle(GetEmployeeByIdForPreferences, {
    variables: { id: me?.id },
  });

  const onRemoveFavoriteSubstitute = async (sub: any) => {
    await removeSub(sub.id, ReplacementPoolType.Favorite);
  };

  const onRemoveBlockedSubstitute = async (sub: any) => {
    await removeSub(sub.id, ReplacementPoolType.Blocked);
  };

  const onAddSubstitute = async (sub: any) => {
    orgUser?.employee?.substitutePreferences?.favoriteSubstitutes.push(sub);

    await addSub(sub.id, ReplacementPoolType.Favorite);
  };

  const onBlockSubstitute = async (sub: any) => {
    orgUser?.employee?.substitutePreferences?.blockedSubstitutes.push(sub);

    await addSub(sub.id, ReplacementPoolType.Blocked);
  };

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

  if (
    getEmployee.state === "LOADING" ||
    !getEmployee?.data?.orgUser?.byId?.employee
  ) {
    return <></>;
  }

  const orgUser = getEmployee?.data?.orgUser?.byId ?? undefined;
  const employee: any = getEmployee?.data?.orgUser?.byId.employee;

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteEmployees={employee?.substitutePreferences?.favoriteSubstitutes}
        blockedEmployees={employee?.substitutePreferences?.blockedSubstitutes}
        heading={t("Substitute Preferences")}
        orgId={orgUser?.orgId ?? ""}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        removeBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        removeFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
        addToBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        addToFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
        useAutoAssign={false}
      ></SubstitutePreferences>
    </>
  );
};
