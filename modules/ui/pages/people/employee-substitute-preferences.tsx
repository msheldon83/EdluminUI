import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeSubstitutePreferenceRoute } from "ui/routes/people";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeSubPreferencesById } from "./graphql/employee/get-employee-sub-preferences.gen";
import { SaveEmployee } from "./graphql/employee/save-employee.gen";
import { SaveReplacementPoolMember } from "./graphql/employee/save-replacement-pool-member.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import {
  PermissionEnum,
  ReplacementPoolMember,
  ReplacementPoolMemberUpdateInput,
} from "graphql/server-types.gen";
import { PersonLinkHeader } from "ui/components/link-headers/person";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(EmployeeSubstitutePreferenceRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getEmployee = useQueryBundle(GetEmployeeSubPreferencesById, {
    variables: { id: params.orgUserId },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (sub: ReplacementPoolMember) => {
    const filteredFavorites = employee.substitutePreferences?.favoriteSubstituteMembers.filter(
      (u: any) => {
        return u.employeeId !== sub.employeeId;
      }
    );
    return updatePreferences(
      filteredFavorites,
      employee.substitutePreferences?.blockedSubstituteMembers
    );
  };

  const onRemoveBlockedSubstitute = async (sub: ReplacementPoolMember) => {
    const filteredBlocked = employee.substitutePreferences?.blockedSubstituteMembers.filter(
      (u: any) => {
        return u.employeeId !== sub.employeeId;
      }
    );
    return updatePreferences(
      employee.substitutePreferences?.favoriteSubstituteMembers,
      filteredBlocked
    );
  };

  const onAddSubstitute = async (sub: ReplacementPoolMember) => {
    employee.substitutePreferences?.favoriteSubstituteMembers.push(sub);

    return updatePreferences(
      employee.substitutePreferences?.favoriteSubstituteMembers,
      employee.substitutePreferences?.blockedSubstituteMembers
    );
  };

  const onBlockSubstitute = async (sub: ReplacementPoolMember) => {
    employee.substitutePreferences?.blockedSubstituteMembers.push(sub);

    return updatePreferences(
      employee.substitutePreferences?.favoriteSubstituteMembers,
      employee.substitutePreferences?.blockedSubstituteMembers
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
    await getEmployee.refetch();
    return true;
  };

  const updatePreferences = async (favorites: any[], blocked: any[]) => {
    const newFavs = favorites.map((s: ReplacementPoolMember) => {
      return { id: s.employeeId };
    });

    const newBlocked = blocked.map((s: ReplacementPoolMember) => {
      return { id: s.employeeId };
    });

    const updatedEmployee: any = {
      id: employee.id,
      substitutePreferences: {
        favoriteSubstitutes: newFavs,
        blockedSubstitutes: newBlocked,
      },
    };

    const result = await updateEmployee({
      variables: {
        employee: updatedEmployee,
      },
    });
    if (!result?.data) return false;
    await getEmployee.refetch();
    return true;
  };

  const [updateEmployee] = useMutationBundle(SaveEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateReplacementPoolMember] = useMutationBundle(
    SaveReplacementPoolMember,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  if (getEmployee.state === "LOADING") {
    return <></>;
  }
  const employee: any = getEmployee?.data?.orgUser?.byId?.employee ?? undefined;

  const headerComponent = (
    <PersonLinkHeader
      title={t("Substitute Preferences")}
      person={getEmployee?.data?.orgUser?.byId ?? undefined}
      params={params}
    />
  );

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteMembers={
          employee.substitutePreferences?.favoriteSubstituteMembers ?? []
        }
        blockedMembers={
          employee.substitutePreferences?.blockedSubstituteMembers ?? []
        }
        onAddNote={onAddNote}
        headerComponent={headerComponent}
        orgId={params.organizationId}
        useAutoAssign={false}
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
