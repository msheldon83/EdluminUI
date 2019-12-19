import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { FieldData } from "ui/components/page-header-multifieldedit";
import { PageTitle } from "ui/components/page-title";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { AccessControl } from "./components/access-control";
import { Information } from "./components/information";
import { Position } from "./components/position";
import { ReplacementCriteria } from "./components/replacement-criteria";
import { RoleTabs } from "./components/role-tabs";
import { SubstitutePreferences } from "./components/substitute-preferences";
import { PersonViewHeader } from "./components/view-header";
import { DeleteOrgUser } from "./graphql/delete-orguser.gen";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { GetOrgUserLastLogin } from "./graphql/get-orguser-lastlogin.gen";
import { UpdateEmployee } from "./graphql/update-employee.gen";
import { UpdateOrgUser } from "./graphql/update-orguser.gen";
import { OrgUserUpdateInput } from "graphql/server-types.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ScheduledAbsences } from "../../components/employee/components/scheduled-absences";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { useMemo } from "react";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { isAfter } from "date-fns";

export const PersonViewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

  const params = useRouteParams(PersonViewRoute);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<OrgUserRole | null>(
    null
  );
  const currentSchoolYear = useCurrentSchoolYear(params.organizationId);

  const [resetPassword] = useMutationBundle(ResetPassword, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });
  const [deleteOrgUserMutation] = useMutationBundle(DeleteOrgUser, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });
  const deleteOrgUser = React.useCallback(() => {
    history.push(PeopleRoute.generate(params));
    return deleteOrgUserMutation({
      variables: {
        orgUserId: Number(params.orgUserId),
      },
    });
  }, [deleteOrgUserMutation, history, params]);

  const [updateEmployee] = useMutationBundle(UpdateEmployee, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });
  const [updateOrgUser] = useMutationBundle(UpdateOrgUser, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  const getOrgUserLastLogin = useQueryBundle(GetOrgUserLastLogin, {
    variables: { id: params.orgUserId },
  });

  if (
    getOrgUser.state === "LOADING" ||
    getOrgUserLastLogin.state === "LOADING"
  ) {
    return <></>;
  }

  const orgUser = getOrgUser?.data?.orgUser?.byId;
  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const onResetPassword = async () => {
    await resetPassword({
      variables: { resetPasswordInput: { id: Number(orgUser.userId) } },
    });
  };

  const employee = orgUser.employee;
  const lastLogin =
    getOrgUserLastLogin?.data?.orgUser?.lastLoginById?.lastLogin;

  const onUpdateOrgUser = async (orgUser: OrgUserUpdateInput) => {
    const result = await updateOrgUser({
      variables: {
        orgUser: orgUser,
      },
    });
    if (result) {
      setEditing(null);
    }
  };

  const defaultSelectedRole = orgUser.isAdmin
    ? OrgUserRole.Administrator
    : orgUser.isEmployee
    ? OrgUserRole.Employee
    : OrgUserRole.ReplacementEmployee;

  //const getAbsenceSchedule: any;
  //if(orgUser.isEmployee){
  const startDate = new Date();
  const endDate = currentSchoolYear?.endDate;
  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: employee?.id ?? "0",
      fromDate: startDate,
      toDate: endDate,
    },
    skip: !employee || !endDate,
  });

  const absences =
    getAbsenceSchedule.state === "LOADING" ||
    getAbsenceSchedule.state === "UPDATING"
      ? []
      : (getAbsenceSchedule.data?.employee
          ?.employeeAbsenceSchedule as GetEmployeeAbsenceSchedule.EmployeeAbsenceSchedule[]);
  const employeeAbsenceDetails = GetEmployeeAbsenceDetails(absences);

  //}

  return (
    <>
      <PageTitle title={t("Person")} withoutHeading={!isMobile} />
      <PersonViewHeader
        orgUser={orgUser}
        editing={editing}
        setEditing={setEditing}
        deleteOrgUser={deleteOrgUser}
        onSaveOrgUser={onUpdateOrgUser}
      />
      <RoleTabs
        orgUser={orgUser}
        selectedRole={selectedRole ?? defaultSelectedRole}
        setSelectedRole={setSelectedRole}
      />
      <Information
        editing={editing}
        orgUser={orgUser}
        lastLogin={lastLogin}
        setEditing={setEditing}
        onResetPassword={onResetPassword}
        selectedRole={selectedRole ?? defaultSelectedRole}
        onSaveOrgUser={onUpdateOrgUser}
      />
      {orgUser.isAdmin &&
        (selectedRole ?? defaultSelectedRole) === OrgUserRole.Administrator && (
          <AccessControl
            editing={editing}
            setEditing={setEditing}
            locations={orgUser?.adminScopeLocationRules?.locations ?? []}
            locationGroups={
              orgUser?.adminScopeLocationRules?.locationGroups ?? []
            }
            positionTypes={
              orgUser?.adminScopePositionTypeRules?.positionTypes ?? []
            }
            allLocationIdsInScope={orgUser?.allLocationIdsInScope}
            allPositionTypeIdsInScope={orgUser?.allPositionTypeIdsInScope}
            isSuperUser={orgUser?.isSuperUser}
          />
        )}
      {orgUser.isEmployee &&
        (selectedRole ?? defaultSelectedRole) === OrgUserRole.Employee && (
          <>
            <Position
              editing={editing}
              setEditing={setEditing}
              positionName={orgUser?.employee?.primaryPosition?.name}
              needsReplacement={
                orgUser?.employee?.primaryPosition?.needsReplacement
              }
              hoursPerFullWorkDay={
                orgUser?.employee?.primaryPosition?.hoursPerFullWorkDay
              }
              contractName={
                orgUser?.employee?.primaryPosition?.currentContract?.name
              }
              scheduleNames={
                orgUser?.employee?.primaryPosition?.schedules?.map(
                  s => s?.name
                ) ?? []
              }
              locationNames={
                orgUser?.employee?.locations?.map(s => s?.name) ?? []
              }
            />
            <ReplacementCriteria editing={editing} setEditing={setEditing} />
            <SubstitutePreferences editing={editing} setEditing={setEditing} />
            <ScheduledAbsences
              header={t("Upcoming Absences")}
              absences={employeeAbsenceDetails.filter(
                (a: EmployeeAbsenceDetail) =>
                  isAfter(a.startTimeLocal, startDate)
              )}
              isLoading={
                getAbsenceSchedule.state === "LOADING" ||
                getAbsenceSchedule.state === "UPDATING"
              }
            />
          </>
        )}
    </>
  );
};
