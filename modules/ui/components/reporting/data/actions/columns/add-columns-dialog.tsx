import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { ColumnSelection } from "./column-selection";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: DataExpression[];
  allFields: DataSourceField[];
  addColumns: (fields: DataSourceField[]) => void;
};

export const AddColumnsDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { open, onClose, title, columns, allFields, addColumns } = props;
  const [selectedColumns, setSelectedColumns] = React.useState<
    DataSourceField[]
  >([]);
  const [expression, setExpression] = React.useState<string | undefined>();

  const clearSettingsAndClose = () => {
    setSelectedColumns([]);
    setExpression(undefined);
    onClose();
  };

  const applyChanges = () => {
    const columnsToAdd = [...selectedColumns];
    addColumns(columnsToAdd);
    clearSettingsAndClose();
  };

  return (
    <Dialog open={open} onClose={clearSettingsAndClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={classes.content}>
        <ColumnSelection
          columns={columns}
          allFields={allFields}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          expression={expression}
          setExpression={setExpression}
          onSubmit={applyChanges}
          onCancel={clearSettingsAndClose}
        />
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    paddingBottom: theme.spacing(2),
  },
}));
