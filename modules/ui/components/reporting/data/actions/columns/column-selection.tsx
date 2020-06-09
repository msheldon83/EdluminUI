import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Input } from "ui/components/form/input";
import { Button, makeStyles } from "@material-ui/core";

type Props = {
  columns: DataExpression[];
  allFields: DataSourceField[];
  selectedColumns: DataSourceField[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<DataSourceField[]>>;
  expression: string | undefined;
  setExpression: React.Dispatch<React.SetStateAction<string | undefined>>;
  onSubmit: () => void;
  onCancel: () => void;
};

export const ColumnSelection: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    columns,
    allFields,
    selectedColumns,
    setSelectedColumns,
    expression,
    setExpression,
    onSubmit,
    onCancel,
  } = props;

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

  return (
    <>
      <div className={classes.columns}>
        <SelectNew
          value={selectedColumns.map(s => {
            return {
              label: s.friendlyName,
              value: s.dataSourceFieldName,
            };
          })}
          placeholder={t("Select columns")}
          multiple
          fixedListBox
          options={options}
          withResetValue={false}
          onChange={value => {
            const fieldNames = value.map((v: OptionType) => v.value);
            const selectedFields = allFields.filter(f =>
              fieldNames.includes(f.dataSourceFieldName)
            );
            if (selectedFields.length > 0 && expression) {
              setExpression(undefined);
            }
            setSelectedColumns(selectedFields);
          }}
        />
      </div>
      <div className={classes.expression}>
        <div className={classes.expressionLabel}>{t("or Add Expression")}</div>
        <Input
          value={expression ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.value && selectedColumns.length > 0) {
              setSelectedColumns([]);
            }
            setExpression(event.target.value ? event.target.value : undefined);
          }}
          placeholder={t("Type expression")}
        />
      </div>
      <div className={classes.actions}>
        <Button variant="outlined" onClick={onCancel}>
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          className={classes.applyButton}
        >
          {t("Apply")}
        </Button>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
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
