import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  OrgUserRole,
  EmployeeInput,
  PermissionEnum,
  NeedsReplacement,
} from "graphql/server-types.gen";
import { GetEmployeeById } from "../graphql/employee/get-employee-by-id.gen";
import { SaveEmployee } from "../graphql/employee/save-employee.gen";
import { UpcomingAbsences } from "../components/employee/upcoming-absences";
import { RemainingBalances } from "ui/pages/employee-pto-balances/components/remaining-balances";
import { Position } from "../components/employee/position";
import { ReplacementCriteria } from "../components/employee/replacement-criteria";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { Information } from "../components/information";
import {
  EmployeeSubstitutePreferenceRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { canEditEmployee } from "helpers/permissions";
import { useCanDo } from "ui/components/auth/can";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const EmployeeTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const canDoFn = useCanDo();
  const { t } = useTranslation();
  const params = useRouteParams(PersonViewRoute);

  const [updateEmployee] = useMutationBundle(SaveEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getEmployee = useQueryBundle(GetEmployeeById, {
    variables: { id: props.orgUserId },
  });

  const orgUser =
    getEmployee.state === "LOADING"
      ? undefined
      : getEmployee?.data?.orgUser?.byId;

  if (getEmployee.state === "LOADING" || !orgUser?.employee) {
    return <></>;
  }

  const employee = orgUser.employee;
  const canEditThisEmployee = canDoFn(canEditEmployee, orgUser.orgId, orgUser);

  const onUpdateEmployee = async (employeeInput: EmployeeInput) => {
    await updateEmployee({
      variables: {
        employee: {
          ...employeeInput,
          id: props.orgUserId,
        },
      },
    });
    props.setEditing(null);
    await getEmployee.refetch();
  };

  return (
    <>
      <Information
        editing={props.editing}
        editable={canEditThisEmployee}
        orgUser={orgUser}
        permissionSet={employee.permissionSet}
        userId={orgUser?.userId}
        loginEmail={orgUser?.loginEmail}
        isSuperUser={false}
        setEditing={props.setEditing}
        selectedRole={props.selectedRole}
        editPermissions={[PermissionEnum.EmployeeSave]}
        onSubmit={onUpdateEmployee}
        temporaryPassword={orgUser?.temporaryPassword ?? undefined}
      />
      <Position
        editing={props.editing}
        editable={canEditThisEmployee}
        setEditing={props.setEditing}
        positionTitle={employee.primaryPosition?.title}
        positionTypeName={employee.primaryPosition?.positionType?.name}
        needsReplacement={employee.primaryPosition?.needsReplacement}
        hoursPerFullWorkDay={employee.primaryPosition?.hoursPerFullWorkDay}
        contractName={employee.primaryPosition?.contract?.name}
        schedules={employee.primaryPosition?.schedules ?? []}
        accountingCodeAllocations={
          employee.primaryPosition?.accountingCodeAllocations ?? []
        }
      />
      <RemainingBalances
        employeeId={employee.id}
        title={t("Time off balances")}
        showEdit={canEditThisEmployee}
        editing={props.editing}
        orgId={params.organizationId}
      />
      {employee.primaryPosition?.needsReplacement != NeedsReplacement.No && (
        <>
          <ReplacementCriteria
            editing={props.editing}
            editable={canEditThisEmployee}
            replacementCriteria={employee?.primaryPosition?.replacementCriteria}
            inheritedReplacementCriteria={
              employee?.primaryPosition?.positionType?.replacementCriteria
            }
          />
          <SubstitutePrefCard
            heading={t("Substitute Preferences")}
            favoriteSubstitutes={
              employee.substitutePreferences.favoriteSubstitutes
            }
            blockedSubstitutes={
              employee.substitutePreferences.blockedSubstitutes
            }
            editRoute={EmployeeSubstitutePreferenceRoute.generate(params)}
            editing={props.editing ? true : false}
            editable={canEditThisEmployee}
            editPermission={[
              PermissionEnum.EmployeeSaveBlockedSubs,
              PermissionEnum.EmployeeSaveFavoriteSubs,
            ]}
          />
        </>
      )}
      <UpcomingAbsences
        employeeId={employee.id}
        orgId={params.organizationId}
      />
    </>
  );
};
