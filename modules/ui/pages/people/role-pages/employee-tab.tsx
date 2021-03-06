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
  DiscussionSubjectType,
  ObjectType,
} from "graphql/server-types.gen";
import { GetEmployeeById } from "../graphql/employee/get-employee-by-id.gen";
import { SaveEmployee } from "../graphql/employee/save-employee.gen";
import { UpcomingAbsences } from "../components/employee/upcoming-absences";
import { RemainingBalances } from "ui/pages/employee-pto-balances/components/remaining-balances";
import { Position } from "../components/employee/position";
import { ReplacementCriteria } from "../components/employee/replacement-criteria";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { useOrganization } from "reference-data/organization";
import { Information } from "../components/information";
import { canEditEmployee } from "helpers/permissions";
import { Comments } from "../components/comments/index";
import {
  EmployeeSubstitutePreferenceRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useCanDo } from "ui/components/auth/can";
import { compact } from "lodash-es";
import { useCurrentSchoolYear } from "reference-data/current-school-year";

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

  const getOrganization = useOrganization(params.organizationId);
  const includeRelatedOrgs = getOrganization?.isStaffingProvider;
  const staffingOrgId = includeRelatedOrgs ? params.organizationId : undefined;

  const getEmployee = useQueryBundle(GetEmployeeById, {
    variables: {
      id: props.orgUserId,
      includeRelatedOrgs: includeRelatedOrgs,
    },
    skip: includeRelatedOrgs === undefined,
  });

  const currentSchoolYear = useCurrentSchoolYear(params.organizationId);

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

  const refetchQuery = async () => {
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

      <Comments
        refetchQuery={refetchQuery}
        staffingOrgId={staffingOrgId}
        comments={orgUser.employee.comments ?? []}
        userId={orgUser.userId ?? ""}
        discussionSubjectType={DiscussionSubjectType.Employee}
        objectType={ObjectType.User}
        orgId={params.organizationId}
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
          employee.primaryPosition?.accountingCodeAllocations
            ? compact(employee.primaryPosition.accountingCodeAllocations)
            : []
        }
      />
      <RemainingBalances
        employeeId={employee.id}
        title={t("Time off balances")}
        showEdit={canEditThisEmployee}
        editing={props.editing}
        orgId={params.organizationId}
        schoolYearId={currentSchoolYear?.id}
      />
      <ReplacementCriteria
        disabled={
          employee.primaryPosition?.needsReplacement == NeedsReplacement.No
        }
        editing={props.editing}
        editable={canEditThisEmployee}
        replacementCriteria={employee?.primaryPosition?.replacementCriteria}
        inheritedReplacementCriteria={
          employee?.primaryPosition?.positionType?.replacementCriteria
        }
      />
      <SubstitutePrefCard
        disabled={
          employee.primaryPosition?.needsReplacement == NeedsReplacement.No
        }
        heading={t("Substitute Preferences")}
        favoriteSubstitutes={employee.substitutePreferences.favoriteSubstitutes}
        blockedSubstitutes={employee.substitutePreferences.blockedSubstitutes}
        editRoute={EmployeeSubstitutePreferenceRoute.generate(params)}
        editing={props.editing ? true : false}
        editable={canEditThisEmployee}
        editPermission={[
          PermissionEnum.EmployeeSaveBlockedSubs,
          PermissionEnum.EmployeeSaveFavoriteSubs,
        ]}
      />
      <UpcomingAbsences
        employeeId={employee.id}
        orgId={params.organizationId}
      />
    </>
  );
};
