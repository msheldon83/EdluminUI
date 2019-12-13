import * as React from "react";
import { Table } from "ui/components/table";
import { TableProps } from "@material-ui/core/Table";

type Props = TableProps & {
  onRowAdd: () => void;
  onRowUpdate: () => void;
  onRowDelete: () => void;
};

export const EditableTable = (props: Props) => {
  const { onRowAdd, onRowUpdate, onRowDelete, ...tableProps } = props;
  return (
    <Table {...tableProps} editable={{ onRowAdd, onRowUpdate, onRowDelete }} />
  );
};
