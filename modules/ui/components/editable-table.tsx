import * as React from "react";
import { Table, TableProps } from "ui/components/table";
import { useMyUserAccess } from "reference-data/my-user-access";
import { PermissionEnum } from "graphql/server-types.gen";
import { useMemo } from "react";
import { can } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { useRole } from "core/role-context";

type Props<T extends object> = TableProps<T> & {
  onRowAdd?: {
    action: (rowData: T) => Promise<void>;
    permissions?: PermissionEnum[];
  };
  onRowUpdate?: {
    action: (newData: T, oldData?: T) => Promise<void>;
    permissions?: PermissionEnum[];
  };
  onRowDelete?: {
    action: (oldData: T) => Promise<void>;
    permissions?: PermissionEnum[];
  };
  editableRows?: ((rowData: T) => boolean) | undefined;
  deletableRows?: ((rowData: T) => boolean) | undefined;
};

export function EditableTable<T extends object>(props: Props<T>) {
  const { onRowAdd, onRowUpdate, onRowDelete, ...tableProps } = props;
  const userAccess = useMyUserAccess();
  const organizationId = useOrganizationId();
  const contextRole = useRole();

  // Handle any permission checking to see if we can Add
  const onRowAddAction = useMemo(() => {
    if (!props.onRowAdd) {
      return undefined;
    }

    if (
      !props.onRowAdd.permissions ||
      can(
        props.onRowAdd.permissions,
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        organizationId,
        contextRole ?? undefined
      )
    ) {
      return props.onRowAdd.action;
    }

    return undefined;
  }, [props.onRowAdd, organizationId, userAccess, contextRole]);

  // Handle any permission checking to see if we can Update
  const onRowUpdateAction = useMemo(() => {
    if (!props.onRowUpdate) {
      return undefined;
    }

    if (
      !props.onRowUpdate.permissions ||
      can(
        props.onRowUpdate.permissions,
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        organizationId,
        contextRole ?? undefined
      )
    ) {
      return props.onRowUpdate.action;
    }

    return undefined;
  }, [props.onRowUpdate, organizationId, userAccess, contextRole]);

  // Handle any permission checking to see if we can Delete
  const onRowDeleteAction = useMemo(() => {
    if (!props.onRowDelete) {
      return undefined;
    }

    if (
      !props.onRowDelete.permissions ||
      can(
        props.onRowDelete.permissions,
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        organizationId,
        contextRole ?? undefined
      )
    ) {
      return props.onRowDelete.action;
    }

    return undefined;
  }, [props.onRowDelete, organizationId, userAccess, contextRole]);

  return (
    <Table
      selection={false}
      isEditable={true}
      editable={{
        onRowAdd: onRowAddAction,
        onRowUpdate: onRowUpdateAction,
        onRowDelete: onRowDeleteAction,
        isEditable: props.editableRows,
        isDeletable: props.deletableRows,
      }}
      {...tableProps}
    />
  );
}
