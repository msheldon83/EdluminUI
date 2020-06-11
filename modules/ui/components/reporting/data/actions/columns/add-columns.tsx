import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Button,
  Popper,
  Fade,
  ClickAwayListener,
} from "@material-ui/core";
import { ColumnSelection } from "./column-selection";
import { convertToDataExpression } from "ui/components/reporting/helpers";

type Props = {
  columns: DataExpression[];
  allFields: DataSourceField[];
  addColumns: (columns: DataExpression[]) => void;
};

export const AddColumns: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { columns, allFields, addColumns } = props;
  const [selectedColumns, setSelectedColumns] = React.useState<
    DataSourceField[]
  >([]);
  const [expressionInfo, setExpressionInfo] = React.useState<
    | { expression?: string | undefined; displayName?: string | undefined }
    | undefined
  >();
  const [addColumnsOpen, setAddColumnsOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const applyChanges = () => {
    const columnsToAdd = convertToDataExpression(
      selectedColumns,
      expressionInfo?.expression,
      expressionInfo?.displayName
    );
    addColumns(columnsToAdd);
    setSelectedColumns([]);
    setExpressionInfo(undefined);
    setAddColumnsOpen(false);
  };

  return (
    <>
      <Button
        color="inherit"
        size={"large"}
        onClick={() => {
          setAddColumnsOpen(!addColumnsOpen);
        }}
        className={classes.actionButton}
        ref={buttonRef}
      >
        {t("Add columns")}
      </Button>
      <Popper
        transition
        open={addColumnsOpen}
        anchorEl={buttonRef.current}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onClick"
                onClickAway={applyChanges}
              >
                <div className={classes.container}>
                  <ColumnSelection
                    columns={columns}
                    allFields={allFields}
                    selectedColumns={selectedColumns}
                    setSelectedColumns={setSelectedColumns}
                    expressionInfo={expressionInfo}
                    setExpressionInfo={setExpressionInfo}
                    onSubmit={applyChanges}
                    onCancel={() => {
                      setSelectedColumns([]);
                      setExpressionInfo(undefined);
                      setAddColumnsOpen(false);
                    }}
                  />
                </div>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
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
