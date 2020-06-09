import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { ColumnSelection } from "./column-selection";
import { Dialog, DialogContent, makeStyles } from "@material-ui/core";

type Props = {
  columns: DataExpression[];
  allFields: DataSourceField[];
  addColumns: (fields: DataSourceField[]) => void;
  refreshReport: () => Promise<void>;
};

export const AddColumnsDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { columns, allFields, addColumns, refreshReport } = props;
  const [selectedColumns, setSelectedColumns] = React.useState<
    DataSourceField[]
  >([]);
  const [expression, setExpression] = React.useState<string | undefined>();
  const [addColumnsOpen, setAddColumnsOpen] = React.useState(false);

  const applyChanges = async () => {
    const columnsToAdd = [...selectedColumns];
    addColumns(columnsToAdd);
    setSelectedColumns([]);
    setExpression(undefined);
    setAddColumnsOpen(false);
    await refreshReport();
  };

  return (
    <Dialog open={addColumnsOpen} onClose={() => setAddColumnsOpen(false)}>
      <DialogContent>
        <ColumnSelection
          columns={columns}
          allFields={allFields}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          expression={expression}
          setExpression={setExpression}
          onSubmit={applyChanges}
          onCancel={() => {
            setSelectedColumns([]);
            setExpression(undefined);
            setAddColumnsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  actionButton: {
    cursor: "pointer",
    minWidth: theme.typography.pxToRem(150),
    background: "rgba(5, 0, 57, 0.6)",
    borderRadius: "4px",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
    color: "#FFFFFF",
    "&:hover": {
      background: "rgba(5, 0, 57, 0.5)",
    },
  },
  container: {
    width: theme.typography.pxToRem(600),
    minHeight: theme.typography.pxToRem(100),
    background: theme.palette.background.paper,
    border: "1px solid #E5E5E5",
    boxSizing: "border-box",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    borderRadius: "4px",
    padding: theme.spacing(2),
  },
}));
