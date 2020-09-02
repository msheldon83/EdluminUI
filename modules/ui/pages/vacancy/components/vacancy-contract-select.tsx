import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Contract } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { Select, OptionType } from "ui/components/form/select";
import { OptionTypeBase } from "react-select";
import { makeStyles } from "@material-ui/styles";

type Props = {
  selectedContractId: string;
  contracts: Contract[];
  setFieldValue: (
    field: any,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  updateModel: (p: any) => void;
  readOnly: boolean;
  vacancyExists: boolean;
};

export const VacancyContractSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    selectedContractId,
    contracts,
    setFieldValue,
    updateModel,
    readOnly,
    vacancyExists,
  } = props;
  const [editMode, setEditMode] = useState(false);
  const classes = useStyles();

  const contractOptions = useMemo(
    () => contracts.map((r: any) => ({ label: r.name, value: r.id })),
    [contracts]
  );

  const selectedValue: OptionTypeBase | undefined =
    selectedContractId !== ""
      ? contractOptions.find(c => c.value === selectedContractId)
      : contractOptions[0];

  return (
    <>
      {!editMode && (
        <Grid container justify="space-between">
          <Grid xs={10} item>
            <Typography className={classes.title}>
              {t("Contract schedule")}
            </Typography>
            <Typography>{selectedValue?.label ?? ""}</Typography>
          </Grid>
          <Grid xs={2} item>
            {!readOnly && !vacancyExists && (
              <TextButton onClick={() => setEditMode(true)}>
                {t("Change")}
              </TextButton>
            )}
          </Grid>
        </Grid>
      )}
      {editMode && (
        <Grid container justify="space-between">
          <Grid xs={12} item>
            <Typography className={classes.title}>
              {t("Contract schedule")}
            </Typography>
            <Select
              options={contractOptions}
              value={{
                value: selectedValue?.value ?? "",
                label: selectedValue?.label,
              }}
              multiple={false}
              onBlur={() => setEditMode(false)}
              withResetValue={false}
              onChange={async (e: OptionType) => {
                let selectedValue: any = null;
                if (e) {
                  selectedValue = (e as OptionTypeBase).value;
                }
                setFieldValue("contractId", selectedValue);
                updateModel({ contractId: selectedValue });
              }}
            ></Select>
          </Grid>
        </Grid>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: "bold",
  },
}));
