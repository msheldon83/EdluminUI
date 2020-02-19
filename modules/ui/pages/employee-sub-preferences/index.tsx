import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeById } from "ui/pages/people/graphql/employee/get-employee-by-id.gen";
import { AddSubPreference } from "./graphql/add-sub-preference.gen";
import { RemoveSubPreference } from "./graphql/remove-sub-preference.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { PermissionEnum, ReplacementPoolType } from "graphql/server-types.gen";
import { useGetEmployee } from "reference-data/employee";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const me = useGetEmployee();

  const getEmployee = useQueryBundle(GetEmployeeById, {
    variables: { id: me?.id },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (sub: any) => {
    await removeSub(sub.id, ReplacementPoolType.Favorite);
  };

  const onRemoveBlockedSubstitute = async (sub: any) => {
    await removeSub(sub.id, ReplacementPoolType.Blocked);
  };

  const onAddSubstitute = async (sub: any) => {
    employee.substitutePreferences?.favoriteSubstitutes.push(sub);

    await addSub(sub.id, ReplacementPoolType.Favorite);
  };

  const onBlockSubstitute = async (sub: any) => {
    employee.substitutePreferences?.blockedSubstitutes.push(sub);

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
          orgId: employee.orgId,
          employee: { id: employee.id },
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
          orgId: employee.orgId,
          employee: { id: employee.id },
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

  if (getEmployee.state === "LOADING") {
    return <></>;
  }
  const employee: any = getEmployee?.data?.orgUser?.byId?.employee ?? undefined;

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteEmployees={employee.substitutePreferences?.favoriteSubstitutes}
        blockedEmployees={employee.substitutePreferences?.blockedSubstitutes}
        heading={t("Substitute Preferences")}
        orgId={employee?.orgId?.toString()}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        removeBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        removeFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
        addToBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        addToFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
        isLocationOnly={false}
      ></SubstitutePreferences>
    </>
  );
};
