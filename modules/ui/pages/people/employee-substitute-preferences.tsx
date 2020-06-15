import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeSubstitutePreferenceRoute } from "ui/routes/people";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeSubPreferencesById } from "./graphql/employee/get-employee-sub-preferences.gen";
import { SaveEmployee } from "./graphql/employee/save-employee.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import { PermissionEnum } from "graphql/server-types.gen";
import { PersonLinkHeader } from "ui/components/link-headers/person";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(EmployeeSubstitutePreferenceRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getEmployee = useQueryBundle(GetEmployeeSubPreferencesById, {
    variables: { id: params.orgUserId },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (sub: any) => {
    const filteredFavorites = employee.substitutePreferences?.favoriteSubstitutes.filter(
      (u: any) => {
        return u.id !== sub.id;
      }
    );
    return updatePreferences(
      filteredFavorites,
      employee.substitutePreferences?.blockedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (sub: any) => {
    const filteredBlocked = employee.substitutePreferences?.blockedSubstitutes.filter(
      (u: any) => {
        return u.id !== sub.id;
      }
    );
    return updatePreferences(
      employee.substitutePreferences?.favoriteSubstitutes,
      filteredBlocked
    );
  };

  const onAddSubstitute = async (sub: any) => {
    employee.substitutePreferences?.favoriteSubstitutes.push(sub);

    return updatePreferences(
      employee.substitutePreferences?.favoriteSubstitutes,
      employee.substitutePreferences?.blockedSubstitutes
    );
  };

  const onBlockSubstitute = async (sub: any) => {
    employee.substitutePreferences?.blockedSubstitutes.push(sub);

    return updatePreferences(
      employee.substitutePreferences?.favoriteSubstitutes,
      employee.substitutePreferences?.blockedSubstitutes
    );
  };

  const updatePreferences = async (favorites: any[], blocked: any[]) => {
    const newFavs = favorites.map((s: any) => {
      return { id: s.id };
    });

    const newBlocked = blocked.map((s: any) => {
      return { id: s.id };
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
        favoriteMembers={employee.substitutePreferences?.favoriteSubstitutes}
        blockedMembers={
          employee.substitutePreferences?.favoriteSubstituteMembers
        }
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
