import * as React from "react";
import { DataExpression, DataSourceField } from "ui/components/reporting/types";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { Select, OptionType } from "ui/components/form/select";
import { Input } from "ui/components/form/input";
import { Button, makeStyles } from "@material-ui/core";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  columns: DataExpression[];
  allFields: DataSourceField[];
  selectedColumns: DataSourceField[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<DataSourceField[]>>;
  expressionInfo:
    | { expression?: string | undefined; displayName?: string | undefined }
    | undefined;
  setExpressionInfo: React.Dispatch<
    React.SetStateAction<
      | { expression?: string | undefined; displayName?: string | undefined }
      | undefined
    >
  >;
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
    expressionInfo,
    setExpressionInfo,
    onSubmit,
    onCancel,
  } = props;

  const userAccess = useMyUserAccess();

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
        <Select
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
            // Maintain the order of selections
            const selectedFields: DataSourceField[] = [];
            fieldNames.forEach(f => {
              const match = allFields.find(a => a.dataSourceFieldName === f);
              if (match) {
                selectedFields.push(match);
              }
            });
            if (selectedFields.length > 0 && expressionInfo) {
              setExpressionInfo(undefined);
            }
            setSelectedColumns(selectedFields);
          }}
        />
      </div>
      {userAccess?.isSysAdmin && (
        <div className={classes.expression}>
          <div className={classes.expressionLabel}>
            {t("or add expression")}
          </div>
          <Input
            value={expressionInfo?.expression ?? ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              if (value && selectedColumns.length > 0) {
                setSelectedColumns([]);
              }
              setExpressionInfo(current => {
                return {
                  ...(current ?? {}),
                  expression: value ?? undefined,
                };
              });
            }}
            placeholder={t("Type expression")}
          />
          {expressionInfo?.expression && (
            <>
              <div className={classes.expressionLabel}>
                {t("with column header")}
              </div>
              <Input
                value={expressionInfo?.displayName ?? ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const value = event.target.value;
                  setExpressionInfo(current => {
                    return {
                      ...(current ?? {}),
                      displayName: value ?? undefined,
                    };
                  });
                }}
              />
            </>
          )}
        </div>
      )}
      <div className={classes.actions}>
        <Button variant="outlined" onClick={onCancel}>
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          className={classes.applyButton}
          disabled={
            selectedColumns.length === 0 &&
            (!expressionInfo?.expression || !expressionInfo?.displayName)
          }
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
    marginBottom: theme.spacing(2),
  },
  expressionLabel: {
    fontWeight: "bold",
    marginTop: theme.spacing(2),
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
