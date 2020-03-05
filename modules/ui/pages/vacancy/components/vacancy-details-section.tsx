import * as React from "react";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import {
  PositionType,
  Location as Loc,
  VacancyCreateInput,
  Contract,
  VacancyDetailInput,
  PayCode,
  AccountingCode,
} from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";

import { compact, sortBy } from "lodash-es";
import { VacancyContractSelect } from "./vacancy-contract-select";
import { OptionTypeBase } from "react-select";
import { Grid, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { VacancyDateSelect } from "./vacancy-date-select";
import { startOfDay, addDays, format } from "date-fns";
import { isSameDay } from "date-fns/esm";
import { differenceWith, filter, find } from "lodash-es";
import { VacancyIndividualDayList } from "./vacancy-individual-day-list";
import { SelectVacancyDateDialog } from "./vacancy-date-picker-dialog";

export type VacancyDetailsFormData = {
  positionTypeId?: string;
  contractId: string;
  locationId: string;
  workDayScheduleId: string;
  notesToApprover?: string;
  notesToReplacement?: string;
  details: VacancyDetailInput[];
};

type Props = {
  orgId: string;
  positionTypes: PositionType[];
  locations: Loc[];
  payCodes: PayCode[];
  accountingCodes: AccountingCode[];
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
    payCodes,
    accountingCodes,
  } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  const [isSelectDatesOpen, setIsSelectDatesOpen] = useState(false);

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

  const toggleVacancyDate = (dates: Date[]) => {
    const newDetails: VacancyDetailInput[] = [];
    dates.forEach(d => {
      const date = startOfDay(d);
      if (find(values.details, vd => isSameDay(vd.date, date))) {
        newDetails.push(
          find(values.details, vd => isSameDay(vd.date, date)) ?? {}
        );
      } else {
        newDetails.push({ date: d });
      }
    });
    setFieldValue("details", newDetails);
    updateModel({ details: newDetails });
    setIsSelectDatesOpen(false);
  };

  const buildDateLabel = React.useMemo(() => {
    let buildSeq = false;
    let seqStartDate;
    let seqEndDate;
    let label = "";
    let currentMonth = "";
    const sortedArray = sortBy(values.details, d => {
      return d.date;
    });
    for (let i = 0; i < sortedArray.length; i++) {
      if (
        i + 1 !== sortedArray.length &&
        isSameDay(addDays(sortedArray[i].date, 1), sortedArray[i + 1].date)
      ) {
        //in sequence
        if (!buildSeq) {
          buildSeq = true;
          seqStartDate = sortedArray[i].date;
          currentMonth =
            currentMonth === ""
              ? format(sortedArray[i].date, "MMM")
              : currentMonth;
        }
      } else if (buildSeq) {
        seqEndDate = sortedArray[i].date;
        label = `${label} ${format(seqStartDate, "MMM d")} - ${format(
          seqEndDate,
          "d"
        )}`;
        buildSeq = false;
      } else if (!buildSeq) {
        if (format(sortedArray[i].date, "MMM") !== currentMonth) {
          currentMonth = format(sortedArray[i].date, "MMM");
          label = `${label} ${format(sortedArray[i].date, "MMM d")}`;
        } else {
          label = `${label}, ${format(sortedArray[i].date, "d")}`;
        }
      }
    }
    return label;
  }, [values.details]);

  const buildSequenceLabel = (startDate: Date, endDate: Date) => {
    const label = `${format(startDate, "MMM d")} - ${format(endDate, "d")}`;
    return label;
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
      <SelectVacancyDateDialog
        open={isSelectDatesOpen}
        onClose={() => setIsSelectDatesOpen(false)}
        onSetDates={toggleVacancyDate}
        contractId={values.contractId}
        vacancyDates={values.details.map((d: VacancyDetailInput) => d.date)}
      />

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
        {/*values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            <VacancyDateSelect
              contractId={values.contractId}
              vacancySelectedDates={values.details.map(
                (d: VacancyDetailInput) => d.date
              )}
              onSelectDates={dates => dates.forEach(d => toggleVacancyDate(d))}
            />
          </Grid>
              )*/}
        {values.positionTypeId !== "" && (
          <Grid item container xs={12} className={classes.rowContainer}>
            <Grid item xs={10}>
              <label>Dates</label>
              <Typography>{buildDateLabel}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Button
                onClick={() => {
                  setIsSelectDatesOpen(true);
                }}
                variant="contained"
              >
                {t("Update")}
              </Button>
            </Grid>
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

        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            <VacancyIndividualDayList
              vacancyDays={values.details}
              payCodes={payCodes}
              accountingCodes={accountingCodes}
              workDayScheduleVariant={locations
                .find(l => l.id === values.locationId)
                ?.workDaySchedules.find(w => w.id === values.workDayScheduleId)
                ?.variants?.find(v => v?.isStandard)}
              orgId={orgId}
              setFieldValue={setFieldValue}
              updateModel={updateModel}
            />
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
