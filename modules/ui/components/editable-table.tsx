import * as React from "react";
import { Table, TableProps } from "ui/components/table";

type Props<T extends object> = TableProps<T> & {
  onRowAdd?: (rowData: T) => Promise<void>;
  onRowUpdate?: (newData: T, oldData?: T) => Promise<void>;
  onRowDelete?: (oldData: T) => Promise<void>;
};

export function EditableTable<T extends object>(props: Props<T>) {
  const { onRowAdd, onRowUpdate, onRowDelete, ...tableProps } = props;
  return (
    <Table
      editable={{
        onRowAdd,
        onRowUpdate,
        onRowDelete,
      }}
      {...tableProps}
    />
  );
}
