import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

import { OrgUserRole, OrgUserUpdateInput } from "graphql/server-types.gen";
import { GetEmployeeById } from "../graphql/employee/get-employee-by-id.gen";
import { UpdateEmployee } from "../graphql/employee/update-employee.gen";

import { UpcomingAbsences } from "../components/employee/upcoming-absences";
import { RemainingBalances } from "ui/pages/employee-pto-balances/components/remaining-balances";
import { Position } from "../components/employee/position";
import { ReplacementCriteria } from "../components/employee/replacement-criteria";
import { SubstitutePreferences } from "../components/employee/substitute-preferences";
import { Information } from "../components/information";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const EmployeeTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [updateEmployee] = useMutationBundle(UpdateEmployee, {
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

  const onUpdateEmployee = async (updatedEmployee: OrgUserUpdateInput) => {
    await updateEmployee({
      variables: {
        orgUser: updatedEmployee,
      },
    });
    props.setEditing(null);
  };

  return (
    <>
      <Information
        editing={props.editing}
        orgUser={employee}
        userId={orgUser?.userId}
        loginEmail={orgUser?.loginEmail}
        isSuperUser={false}
        setEditing={props.setEditing}
        selectedRole={props.selectedRole}
        onSaveOrgUser={onUpdateEmployee}
      />
      <Position
        editing={props.editing}
        setEditing={props.setEditing}
        positionName={employee.primaryPosition?.name}
        needsReplacement={employee.primaryPosition?.needsReplacement}
        hoursPerFullWorkDay={employee.primaryPosition?.hoursPerFullWorkDay}
        contractName={employee.primaryPosition?.currentContract?.name}
        scheduleNames={
          employee.primaryPosition?.schedules?.map(s => s?.name) ?? []
        }
        locationNames={employee.locations?.map(s => s?.name) ?? []}
      />
      <RemainingBalances
        employeeId={employee.id}
        title={t("Time off balances")}
        showEdit={false} // TODO: Set to true when we have an edit page
        editing={props.editing}
      />
      <ReplacementCriteria
        editing={props.editing}
        replacementCriteria={employee.primaryPosition?.replacementCriteria}
      />
      <SubstitutePreferences
        editing={props.editing}
        substitutePools={employee.substitutePools}
      />
      <UpcomingAbsences
        employeeId={employee.id}
        orgId={employee.orgId.toString()}
      />
    </>
  );
};
