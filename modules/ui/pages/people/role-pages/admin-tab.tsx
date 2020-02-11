import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

import {
  OrgUserRole,
  AdministratorInput,
  PermissionEnum,
} from "graphql/server-types.gen";
import { GetAdminById } from "../graphql/admin/get-admin-by-id.gen";
import { SaveAdmin } from "../graphql/admin/save-administrator.gen";

import { AccessControl } from "../components/admin/access-control";
import { Information } from "../components/information";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const AdminTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();

  const [updateAdmin] = useMutationBundle(SaveAdmin, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getAdmin = useQueryBundle(GetAdminById, {
    variables: { id: props.orgUserId },
  });

  const orgUser =
    getAdmin.state === "LOADING" ? undefined : getAdmin?.data?.orgUser?.byId;

  if (getAdmin.state === "LOADING" || !orgUser?.administrator) {
    return <></>;
  }

  const admin = orgUser.administrator;

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

  const onCancelAdmin = () => {
    props.setEditing(null);
  };

  return (
    <>
      <Information
        editing={props.editing}
        orgUser={admin}
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
    </>
  );
};
