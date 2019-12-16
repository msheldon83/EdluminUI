import * as React from "react";
import { Table, TableProps } from "ui/components/table";

type Props<T extends object> = TableProps<T> & {
  onRowAdd?: (rowData: object) => Promise<void>;
  onRowUpdate?: (newData: object, oldData?: object) => Promise<void>;
  onRowDelete?: (oldData: object) => Promise<void>;
};

export function EditableTable<T extends object>(props: Props<T>) {
  const { onRowAdd, onRowUpdate, onRowDelete, ...tableProps } = props;
  return (
    <Table editable={{ onRowAdd, onRowUpdate, onRowDelete }} {...tableProps} />
  );
}
