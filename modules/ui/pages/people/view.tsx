import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { AccessControl } from "./components/access-control";
import { Information } from "./components/information";
import { Position } from "./components/position";
import { ReplacementCriteria } from "./components/replacement-criteria";
import { RoleTabs } from "./components/role-tabs";
import { OrganizationList } from "./components/org-list";
import { SubstitutePreferences } from "./components/substitute-preferences";
import { PersonViewHeader } from "./components/view-header";
import { DeleteOrgUser } from "./graphql/delete-orguser.gen";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { GetOrgUserLastLogin } from "./graphql/get-orguser-lastlogin.gen";
import { UpdateEmployee } from "./graphql/update-employee.gen";
import { UpdateOrgUser } from "./graphql/update-orguser.gen";
import { OrgUserUpdateInput, OrgUser } from "graphql/server-types.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { UpcomingAbsences } from "./components/upcoming-absences";
import { RemainingBalances } from "ui/pages/employee-pto-balances/components/remaining-balances";
import { ShowErrors } from "ui/components/error-helpers";

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

  const [resetPassword] = useMutationBundle(ResetPassword, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [deleteOrgUserMutation] = useMutationBundle(DeleteOrgUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const deleteOrgUser = React.useCallback(async () => {
    await deleteOrgUserMutation({
      variables: {
        orgUserId: Number(params.orgUserId),
      },
    });
    history.push(PeopleRoute.generate(params));
  }, [deleteOrgUserMutation, history, params]);

  const [updateEmployee] = useMutationBundle(UpdateEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [updateOrgUser] = useMutationBundle(UpdateOrgUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  const getOrgUserLastLogin = useQueryBundle(GetOrgUserLastLogin, {
    variables: { id: params.orgUserId },
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  if (
    getOrgUser.state === "LOADING" ||
    getOrgUserLastLogin.state === "LOADING"
  ) {
    return <></>;
  }

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
    await updateOrgUser({
      variables: {
        orgUser: orgUser,
      },
    });
    setEditing(null);
  };

  const defaultSelectedRole = orgUser.isAdmin
    ? OrgUserRole.Administrator
    : orgUser.isEmployee
    ? OrgUserRole.Employee
    : OrgUserRole.ReplacementEmployee;

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
            <RemainingBalances
              employeeId={orgUser?.id}
              title={t("Time off balances")}
              showEdit={false} // TODO: Set to true when we have an edit page
              editing={editing}
              setEditing={setEditing}
            />
            <ReplacementCriteria
              editing={editing}
              setEditing={setEditing}
              replacementCriteria={
                orgUser?.employee?.primaryPosition?.replacementCriteria
              }
            />
            <SubstitutePreferences
              editing={editing}
              setEditing={setEditing}
              substitutePools={orgUser?.employee?.substitutePools}
            />
            {orgUser?.id && (
              <UpcomingAbsences
                employeeId={orgUser?.id}
                orgId={params.organizationId}
              />
            )}
          </>
        )}
      {orgUser.isReplacementEmployee &&
        (selectedRole ?? defaultSelectedRole) ===
          OrgUserRole.ReplacementEmployee && (
          <>
            <OrganizationList
              editing={editing}
              orgs={orgUser?.relatedOrganizations}
              setEditing={setEditing}
            />
          </>
        )}
    </>
  );
};
