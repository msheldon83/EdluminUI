import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeSubstitutePreferenceRoute } from "ui/routes/people";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeById } from "./graphql/employee/get-employee-by-id.gen";
import { SaveEmployee } from "./graphql/employee/save-employee.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(EmployeeSubstitutePreferenceRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getEmployee = useQueryBundle(GetEmployeeById, {
    variables: { id: params.orgUserId },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteEmployee = async (emp: any) => {
    const filteredFavorites = employee.substitutePools?.favoriteEmployees.filter(
      (u: any) => {
        return u.id !== emp.id;
      }
    );
    return updatePreferences(
      filteredFavorites,
      employee.substitutePools?.blockedEmployees
    );
  };

  const onRemoveBlockedEmployee = async (emp: any) => {
    const filteredBlocked = employee.substitutePools?.blockedEmployees.filter(
      (u: any) => {
        return u.id !== emp.id;
      }
    );
    return updatePreferences(
      employee.substitutePools?.favoriteEmployees,
      filteredBlocked
    );
  };

  const onAddEmployee = async (emp: any) => {
    console.log(employee.substitutePools?.favoriteEmployees);
    console.log(emp);
    employee.substitutePools?.favoriteEmployees.push(emp);

    return updatePreferences(
      employee.substitutePools?.favoriteEmployees,
      employee.substitutePools?.blockedEmployees
    );
  };

  const onBlockEmployee = async (emp: any) => {
    employee.substitutePools?.blockedEmployees.push(emp);

    return updatePreferences(
      employee.substitutePools?.favoriteEmployees,
      employee.substitutePools?.blockedEmployees
    );
  };

  const updatePreferences = async (favorites: any[], blocked: any[]) => {
    const neweFavs = favorites.map((s: any) => {
      return { id: s.id };
    });

    const neweBlocked = blocked.map((s: any) => {
      return { id: s.id };
    });
    const updatedEmployee: any = {
      id: employee.id,
      rowVersion: employee.rowVersion,
      substitutePools: {
        favoriteEmployees: neweFavs,
        blockedEmployees: neweBlocked,
      },
    };
    const result = await updateEmployee({
      variables: {
        employee: updatedEmployee,
      },
    });
    if (result === undefined) return false;
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

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteEmployees={employee.substitutePools?.favoriteEmployees}
        blockedEmployees={employee.substitutePools?.blockedEmployees}
        heading={t("Substitute Preferences")}
        subHeading={`${employee.firstName ?? ""} ${employee.middleName ??
          ""} ${employee.lastName ?? ""}`}
        orgId={params.organizationId}
        onRemoveFavoriteEmployee={onRemoveFavoriteEmployee}
        onRemoveBlockedEmployee={onRemoveBlockedEmployee}
        onAddFavoriteEmployee={onAddEmployee}
        onBlockEmployee={onBlockEmployee}
      ></SubstitutePreferences>
    </>
  );
};
