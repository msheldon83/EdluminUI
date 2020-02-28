import * as React from "react";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import {
  PositionType,
  Location as Loc,
  VacancyCreateInput,
  Contract,
} from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";

import { compact } from "lodash-es";
import { VacancyContractSelect } from "./vacancy-contract-select";
import { OptionTypeBase } from "react-select";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { VacancyDateSelect } from "./vacancy-date-select";

export type VacancyDetailsFormData = {
  positionTypeId?: string;
  contractId: string;
  locationId: string;
  workDayScheduleId: string;
  notesToApprover?: string;
  notesToReplacement?: string;
};

type Props = {
  orgId: string;
  positionTypes: PositionType[];
  locations: Loc[];
  contracts: Contract[];
  values: VacancyDetailsFormData;
  setFieldValue: (
    field: any,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setVacancyForCreate: React.Dispatch<React.SetStateAction<VacancyCreateInput>>;
};

export const VacancyDetailSection: React.FC<Props> = props => {
  const {
    values,
    positionTypes,
    orgId,
    locations,
    setFieldValue,
    setVacancyForCreate,
    contracts,
  } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  const positionTypeOptions = useMemo(
    () => positionTypes.map((r: any) => ({ label: r.name, value: r.id })),
    [positionTypes]
  );

  const locationOptions = useMemo(() => {
    return locations
      ? locations.map((r: any) => ({ label: r.name, value: r.id }))
      : [];
  }, [locations]);

  const bellScheduleOptions = useMemo(() => {
    return locations
      ? locations
          .find(l => {
            if (values.locationId) {
              return l.id === values.locationId;
            } else {
              return l.id === locationOptions[0].value;
            }
          })
          ?.workDaySchedules.map((r: any) => ({
            label: r.name,
            value: r.id,
          })) ?? []
      : [];
  }, [locations]);

  const updateModel = (p: any) => {
    const vacancy = {
      ...values,
      orgId: orgId,
      ...p,
    };
    setVacancyForCreate(vacancy);
  };

  //default properties
  useEffect(() => {
    if (!values.locationId) {
      setFieldValue("locationId", locationOptions[0].value);
      updateModel({ locationId: locationOptions[0].value });
    }
    if (!values.contractId) {
      setFieldValue("contractId", contracts[0].id);
      updateModel({ contractId: contracts[0].id });
    }
    if (!values.workDayScheduleId) {
      setFieldValue("workDayScheduleId", bellScheduleOptions[0].value);
      updateModel({ workDayScheduleId: bellScheduleOptions[0].value });
    }
  }, []);

  return (
    <>
      <Typography variant="h6">{t("Vacancy Details")}</Typography>
      <Grid container justify="space-between">
        <Grid item xs={12} className={classes.rowContainer}>
          <Select
            placeholder={t("Please select a Postion type")}
            value={{
              value: values.positionTypeId ?? "",
              label:
                positionTypeOptions.find(a => a.value === values.positionTypeId)
                  ?.label || "",
            }}
            options={positionTypeOptions}
            multiple={false}
            label={t("Position type")}
            onChange={async (e: OptionType) => {
              let selectedValue: any = null;
              if (e) {
                selectedValue = (e as OptionTypeBase).value;
              }
              setFieldValue("positionTypeId", selectedValue);
              setFieldValue(
                "contractId",
                positionTypes.find(pt => pt.id === selectedValue)
                  ?.defaultContractId ?? ""
              );
              updateModel({ positionTypeId: selectedValue });
            }}
            withResetValue={false}
          ></Select>
        </Grid>
        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            <VacancyContractSelect
              contracts={contracts}
              selectedContractId={values.contractId}
              setFieldValue={setFieldValue}
              updateModel={updateModel}
            />
          </Grid>
        )}
        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            <VacancyDateSelect contractId={values.contractId} />
          </Grid>
        )}

        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            <Select
              placeholder={t("Please select a School")}
              value={{
                value: values.locationId ?? locationOptions[0].value,
                label:
                  locationOptions.find(
                    (a: any) => a.value === values.locationId
                  )?.label || locationOptions[0].label,
              }}
              options={locationOptions}
              multiple={false}
              label={t("Location")}
              withResetValue={false}
              onChange={async (e: OptionType) => {
                let selectedValue: any = null;
                if (e) {
                  selectedValue = (e as OptionTypeBase).value;
                }
                setFieldValue("locationId", selectedValue);

                updateModel({ locationId: selectedValue });
              }}
            ></Select>
          </Grid>
        )}

        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            <Select
              value={{
                value: values.workDayScheduleId ?? bellScheduleOptions[0].value,
                label:
                  bellScheduleOptions.find(
                    (a: any) => a.value === values.workDayScheduleId
                  )?.label || bellScheduleOptions[0].label,
              }}
              options={bellScheduleOptions}
              multiple={false}
              label={t("Bell Schedule")}
              withResetValue={false}
              onChange={async (e: OptionType) => {
                let selectedValue: any = null;
                if (e) {
                  selectedValue = (e as OptionTypeBase).value;
                }
                setFieldValue("workDayScheduleId", selectedValue);

                updateModel({ workDayScheduleId: selectedValue });
              }}
            ></Select>
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  rowContainer: {
    marginTop: theme.typography.pxToRem(10),
    marginBottom: theme.typography.pxToRem(10),
    "& label": {
      fontWeight: "bold",
    },
  },
}));
