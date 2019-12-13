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

export const PersonViewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();

  const params = useRouteParams(PersonViewRoute);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<boolean | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<OrgUserRole | null>(
    null
  );

  const [resetPassword] = useMutationBundle(ResetPassword);
  const [deleteOrgUserMutation] = useMutationBundle(DeleteOrgUser);
  const deleteOrgUser = React.useCallback(() => {
    history.push(PeopleRoute.generate(params));
    return deleteOrgUserMutation({
      variables: {
        orgUserId: Number(params.orgUserId),
      },
    });
  }, [deleteOrgUserMutation, history, params]);

  const [updateEmployee] = useMutationBundle(UpdateEmployee);
  const [updateOrgUser] = useMutationBundle(UpdateOrgUser);
  const activateDeactivateOrgUser = React.useCallback(
    (active: boolean, rowVersion: string) => {
      return updateOrgUser({
        variables: {
          orgUser: {
            id: Number(params.orgUserId),
            rowVersion: rowVersion,
            active: active,
          },
        },
      });
    },
    [updateOrgUser, params]
  );

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

  if (active === null) {
    setActive(orgUser.active);
  }

  const updateName = async (nameFields: FieldData[]) => {
    const lastName = nameFields.find(x => x.key === "lastName")?.value;
    const middleName = nameFields.find(x => x.key === "middleName")?.value;
    const firstName = nameFields.find(x => x.key === "firstName")?.value;

    await updateOrgUser({
      variables: {
        orgUser: {
          id: Number(orgUser.id),
          rowVersion: orgUser.rowVersion,
          lastName,
          firstName,
          middleName,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updateOrgUser({
      variables: {
        orgUser: {
          id: Number(orgUser.id),
          rowVersion: orgUser.rowVersion,
          externalId,
        },
      },
    });
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
        active={active}
        setEditing={setEditing}
        setActive={setActive}
        updateName={updateName}
        updateExternalId={updateExternalId}
        deleteOrgUser={deleteOrgUser}
        activateDeactivateOrgUser={activateDeactivateOrgUser}
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
            <SubstitutePreferences editing={editing} setEditing={setEditing} />
            <ReplacementCriteria editing={editing} setEditing={setEditing} />
          </>
        )}
    </>
  );
};
