import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { ColumnSelection } from "./column-selection";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { convertToDataExpression } from "ui/components/reporting/helpers";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: DataExpression[];
  allFields: DataSourceField[];
  addColumns: (columns: DataExpression[]) => void;
};

export const AddColumnsDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { open, onClose, title, columns, allFields, addColumns } = props;
  const [selectedColumns, setSelectedColumns] = React.useState<
    DataSourceField[]
  >([]);
  const [expressionInfo, setExpressionInfo] = React.useState<
    | { expression?: string | undefined; displayName?: string | undefined }
    | undefined
  >();

  const clearSettingsAndClose = React.useCallback(() => {
    setSelectedColumns([]);
    setExpressionInfo(undefined);
    onClose();
  }, [onClose]);

  const applyChanges = React.useCallback(() => {
    const columnsToAdd = convertToDataExpression(
      selectedColumns,
      expressionInfo?.expression,
      expressionInfo?.displayName
    );
    addColumns(columnsToAdd);
    clearSettingsAndClose();
  }, [addColumns, clearSettingsAndClose, expressionInfo, selectedColumns]);

  return (
    <Dialog open={open} onClose={clearSettingsAndClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={classes.content}>
        <ColumnSelection
          columns={columns}
          allFields={allFields}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          expressionInfo={expressionInfo}
          setExpressionInfo={setExpressionInfo}
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
