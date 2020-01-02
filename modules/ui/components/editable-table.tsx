import * as React from "react";
import { Table, TableProps } from "ui/components/table";
import { MTableActions } from "material-table";

type Props<T extends object> = TableProps<T> & {
  onRowAdd?: (rowData: T) => Promise<void>;
  onRowUpdate?: (newData: T, oldData?: T) => Promise<void>;
  onRowDelete?: (oldData: T) => Promise<void>;
  editableRows?: ((rowData: T) => boolean) | undefined;
  deletableRows?: ((rowData: T) => boolean) | undefined;
};

export function EditableTable<T extends object>(props: Props<T>) {
  const { onRowAdd, onRowUpdate, onRowDelete, ...tableProps } = props;

  return (
    <Table
      selection={false}
      isEditable={true}
      editable={{
        onRowAdd,
        onRowUpdate,
        onRowDelete,
        isEditable: props.editableRows,
        isDeletable: props.deletableRows,
      }}
      {...tableProps}
    />
  );
}
