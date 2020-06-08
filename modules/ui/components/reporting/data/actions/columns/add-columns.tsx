import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Button,
  Popper,
  Fade,
  ClickAwayListener,
  Typography,
} from "@material-ui/core";
import { compact } from "lodash-es";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Input } from "ui/components/form/input";

type Props = {
  columns: DataExpression[];
  allFields: DataSourceField[];
  addColumns: (fields: DataSourceField[]) => void;
  refreshReport: () => Promise<void>;
};

export const AddColumns: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { columns, allFields, addColumns, refreshReport } = props;
  const [selectedColumns, setSelectedColumns] = React.useState<
    DataSourceField[]
  >([]);
  const [expression, setExpression] = React.useState<string | undefined>();
  const [addColumnsOpen, setAddColumnsOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const options = React.useMemo(() => {
    const currentDataSourceFieldColumns = compact(
      columns.map(c => c.dataSourceField?.dataSourceFieldName)
    );

    return allFields
      .filter(
        f => !currentDataSourceFieldColumns.includes(f.dataSourceFieldName)
      )
      .map(f => {
        return {
          label: f.friendlyName,
          value: f.dataSourceFieldName,
        };
      });
  }, [allFields, columns]);

  const applyChanges = async () => {
    const columnsToAdd = [...selectedColumns];
    addColumns(columnsToAdd);
    setSelectedColumns([]);
    setAddColumnsOpen(false);
    await refreshReport();
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
        {t("ADD COLUMNS")}
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
                onClickAway={async () => {
                  await applyChanges();
                }}
              >
                <div className={classes.container}>
                  <div className={classes.columns}>
                    <SelectNew
                      value={selectedColumns.map(s => {
                        return {
                          label: s.friendlyName,
                          value: s.dataSourceFieldName,
                        };
                      })}
                      multiple={true}
                      options={options}
                      withResetValue={false}
                      onChange={value => {
                        const fieldNames = value.map(
                          (v: OptionType) => v.value
                        );
                        const selectedFields = allFields.filter(f =>
                          fieldNames.includes(f.dataSourceFieldName)
                        );
                        setSelectedColumns(selectedFields);
                      }}
                    />
                  </div>
                  <div className={classes.expression}>
                    <div className={classes.expressionLabel}>
                      {t("or Add Expression")}
                    </div>
                    <Input
                      value={expression ?? ""}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setExpression(
                          event.target.value ? event.target.value : undefined
                        );
                      }}
                      placeholder={t("Type expression")}
                    />
                  </div>
                  <div className={classes.actions}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        setSelectedColumns([]);
                        setAddColumnsOpen(false);
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        await applyChanges();
                      }}
                      className={classes.applyButton}
                    >
                      {t("Apply")}
                    </Button>
                  </div>
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
  columns: {
    width: theme.typography.pxToRem(300),
  },
  expression: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  expressionLabel: {
    fontWeight: "bold",
    marginBottom: theme.spacing(),
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: theme.spacing(2),
  },
  applyButton: {
    marginLeft: theme.spacing(2),
  },
}));
