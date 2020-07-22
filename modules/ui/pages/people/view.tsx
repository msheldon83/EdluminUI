import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { RoleTabs } from "./components/role-tabs";
import { PersonViewHeader } from "./components/view-header";
import { DeleteOrgUser } from "./graphql/delete-orguser.gen";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { UpdateOrgUser } from "./graphql/update-orguser.gen";
import { OrgUserUpdateInput } from "graphql/server-types.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AdminTab } from "./role-pages/admin-tab";
import { EmployeeTab } from "./role-pages/employee-tab";
import { SubstituteTab } from "./role-pages/substitute-tab";
import { makeStyles } from "@material-ui/core";
import { GetOrgConfigStatus } from "reference-data/get-org-config-status.gen";
import { RemoveOrgUserRole } from "./graphql/remove-orguser-role.gen";
import { SaveAdmin } from "./graphql/admin/save-administrator.gen";
import { SaveEmployee } from "./graphql/employee/save-employee.gen";
import { SaveSubstitute } from "./graphql/substitute/save-substitute.gen";

export const PersonViewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

  const params = useRouteParams(PersonViewRoute);

  const [editing, setEditing] = React.useState<string | null>(null);

  // If the org user changes because we've searched for an org user and selected them
  // set editing to false so that we close all editing sections and reset the forms
  useEffect(() => {
    setEditing(null);
  }, [params.orgUserId]);

  const [selectedRole, setSelectedRole] = React.useState<OrgUserRole | null>(
    null
  );

  const [deleteOrgUserMutation] = useMutationBundle(DeleteOrgUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const deleteOrgUser = React.useCallback(async () => {
    await deleteOrgUserMutation({
      variables: {
        orgUserId: params.orgUserId,
      },
    });
    history.push(PeopleRoute.generate(params));
  }, [deleteOrgUserMutation, history, params]);

  const [updateOrgUser] = useMutationBundle(UpdateOrgUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateAdmin] = useMutationBundle(SaveAdmin, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateSub] = useMutationBundle(SaveSubstitute, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateEmployee] = useMutationBundle(SaveEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [removeRole] = useMutationBundle(RemoveOrgUserRole, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  const getOrgStatus = useQueryBundle(GetOrgConfigStatus, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  if (getOrgUser.state === "LOADING") {
    return <></>;
  }

  const orgConfig =
    getOrgStatus.state === "LOADING"
      ? undefined
      : getOrgStatus?.data?.organization?.byId?.config;

  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const onUpdateOrgUser = async (orgUser: OrgUserUpdateInput) => {
    await updateOrgUser({
      variables: {
        orgUser: orgUser,
      },
    });

    setEditing(null);
  };

  const handleSetOrgUserActivation = async (remove: boolean) => {
    const userObject = {
      id: orgUser.id,
      active: !orgUser.active,
      removeFutureAssignmentsOnInactivate: remove,
    };

    if (orgUser.isReplacementEmployee) {
      await updateSub({
        variables: {
          substitute: userObject,
        },
      });
    } else if (orgUser.isEmployee) {
      await updateEmployee({
        variables: {
          employee: userObject,
        },
      });
    } else if (orgUser.isAdmin) {
      await updateAdmin({
        variables: {
          administrator: userObject,
        },
      });
    }
    await getOrgUser.refetch();
  };

  const onRemoveRole = async (orgUserRole: OrgUserRole) => {
    await removeRole({
      variables: {
        orgUserId: params.orgUserId,
        orgUserRole,
      },
    });
    if (selectedRole == orgUserRole) setSelectedRole(null);
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
        orgStatus={orgConfig?.organizationTypeId}
        orgFeatureFlags={orgConfig?.featureFlags}
        orgUser={orgUser}
        editing={editing}
        setEditing={setEditing}
        deleteOrgUser={deleteOrgUser}
        onSaveOrgUser={onUpdateOrgUser}
        onSetOrgUserActivation={handleSetOrgUserActivation}
        onRemoveRole={onRemoveRole}
        selectedRole={selectedRole ?? defaultSelectedRole}
        orgId={params.organizationId}
      />
      <div className={classes.content}>
        <RoleTabs
          orgUser={orgUser}
          selectedRole={selectedRole ?? defaultSelectedRole}
          setSelectedRole={setSelectedRole}
        />
        {(selectedRole ?? defaultSelectedRole) === OrgUserRole.Administrator ? (
          orgUser.isAdmin ? (
            <AdminTab
              editing={editing}
              setEditing={setEditing}
              selectedRole={selectedRole ?? defaultSelectedRole}
              orgUserId={orgUser.id}
            />
          ) : (
            <div>{t("Create administrator user")}</div>
          )
        ) : (selectedRole ?? defaultSelectedRole) === OrgUserRole.Employee ? (
          orgUser.isEmployee ? (
            <EmployeeTab
              editing={editing}
              setEditing={setEditing}
              selectedRole={selectedRole ?? defaultSelectedRole}
              orgUserId={orgUser.id}
            />
          ) : (
            <div>{t("Create employee")}</div>
          )
        ) : orgUser.isReplacementEmployee ? (
          <SubstituteTab
            editing={editing}
            setEditing={setEditing}
            selectedRole={selectedRole ?? defaultSelectedRole}
            orgUserId={orgUser.id}
            userId={orgUser.userId ?? ""}
          />
        ) : (
          <div>{t("Create substitute")}</div>
        )}
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
