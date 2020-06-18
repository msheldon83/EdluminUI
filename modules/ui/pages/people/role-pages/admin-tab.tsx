import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

import {
  OrgUserRole,
  OrganizationRelationshipType,
  AdministratorInput,
  PermissionEnum,
  ApproverGroupAddMemberInput,
} from "graphql/server-types.gen";
import { GetAdminById } from "../graphql/admin/get-admin-by-id.gen";
import { SaveApproverGroupMember } from "../graphql/admin/save-approver-group-membership.gen";
import { SaveAdmin } from "../graphql/admin/save-administrator.gen";
import { OrganizationList } from "../components/admin/org-list";
import { PersonViewRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { AccessControl } from "../components/admin/access-control";
import { ApproverGroupMembership } from "../components/admin/approver-group-membership";
import { Information } from "../components/information";
import { GetOrganizationRelationships } from "../graphql/get-org-relationships.gen";
import { canEditAdmin } from "helpers/permissions";
import { useCanDo } from "ui/components/auth/can";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const AdminTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const canDoFn = useCanDo();
  const params = useRouteParams(PersonViewRoute);

  const [updateAdmin] = useMutationBundle(SaveAdmin, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateApproverGroupMembership] = useMutationBundle(
    SaveApproverGroupMember,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const getAdmin = useQueryBundle(GetAdminById, {
    variables: { id: props.orgUserId },
  });

  const getOrgRelationships = useQueryBundle(GetOrganizationRelationships, {
    variables: { orgId: params.organizationId },
  });
  const showRelatedOrgs =
    getOrgRelationships.state === "LOADING"
      ? false
      : getOrgRelationships?.data?.organizationRelationship?.all?.find(
          x => x?.relationshipType === OrganizationRelationshipType.Services
        )
      ? true
      : false;

  const orgUser =
    getAdmin.state === "LOADING" ? undefined : getAdmin?.data?.orgUser?.byId;

  if (getAdmin.state === "LOADING" || !orgUser?.administrator) {
    return <></>;
  }

  const admin = orgUser.administrator;
  const canEditThisAdmin = canDoFn(canEditAdmin, orgUser.orgId, orgUser);

  const onUpdateAdmin = async (admin: AdministratorInput) => {
    await updateAdmin({
      variables: {
        administrator: {
          ...admin,
          id: props.orgUserId,
        },
      },
    });
    props.setEditing(null);
    await getAdmin.refetch();
  };

  const onUpdateApproverGroupMembership = async (
    member: ApproverGroupAddMemberInput
  ) => {
    await updateApproverGroupMembership({
      variables: {
        member: member,
      },
    });
    props.setEditing(null);
    await getAdmin.refetch();
  };

  const onCancelAdmin = () => {
    props.setEditing(null);
  };

  return (
    <>
      <Information
        editing={props.editing}
        editable={canEditThisAdmin}
        orgUser={orgUser}
        permissionSet={admin.permissionSet}
        userId={orgUser?.userId}
        loginEmail={orgUser?.loginEmail}
        isSuperUser={admin?.isSuperUser ?? false}
        setEditing={props.setEditing}
        selectedRole={props.selectedRole}
        editPermissions={[PermissionEnum.AdminSave]}
        onSubmit={onUpdateAdmin}
        onCancel={onCancelAdmin}
        temporaryPassword={orgUser?.temporaryPassword ?? undefined}
      />
      <AccessControl
        editing={props.editing}
        editable={canEditThisAdmin}
        setEditing={props.setEditing}
        orgId={orgUser.orgId.toString()}
        locations={admin?.accessControl?.locations ?? []}
        locationGroups={admin?.accessControl?.locationGroups ?? []}
        positionTypes={admin?.accessControl?.positionTypes ?? []}
        allLocationIdsInScope={
          admin?.accessControl?.allLocationIdsInScope ?? false
        }
        allPositionTypeIdsInScope={
          admin?.accessControl?.allPositionTypeIdsInScope ?? false
        }
        locationIds={admin?.accessControl?.locationIds ?? []}
        locationGroupIds={admin?.accessControl?.locationGroupIds ?? []}
        positionTypeIds={admin?.accessControl?.positionTypeIds ?? []}
        isSuperUser={admin?.isSuperUser ?? false}
        permissionSet={admin.permissionSet}
        onSubmit={onUpdateAdmin}
        onCancel={onCancelAdmin}
      />
      <ApproverGroupMembership
        editing={props.editing}
        editable={canEditThisAdmin}
        setEditing={props.setEditing}
        orgId={orgUser.orgId.toString()}
        onSubmit={onUpdateApproverGroupMembership}
        onCancel={onCancelAdmin}
      />
      {showRelatedOrgs && (
        <OrganizationList
          editing={props.editing}
          orgs={orgUser.relatedOrganizations}
        />
      )}
    </>
  );
};
