import * as React from "react";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import {
  PositionType,
  Location as Loc,
  Contract,
  VacancyDetailInput,
  PayCode,
  AccountingCode,
} from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { sortBy } from "lodash-es";
import { VacancyContractSelect } from "./vacancy-contract-select";
import { OptionTypeBase } from "react-select";
import { Grid, Typography, Button, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { startOfDay, addDays, format } from "date-fns";
import { isSameDay } from "date-fns/esm";
import { find } from "lodash-es";
import { VacancyIndividualDayList } from "./vacancy-individual-day-list";
import { SelectVacancyDateDialog } from "./vacancy-date-picker-dialog";
import { Input } from "ui/components/form/input";
import { VacancyDetailsFormData } from "./vacancy";

type Props = {
  orgId: string;
  positionTypes: PositionType[];
  locations: Loc[];
  payCodes?: PayCode[];
  accountingCodes?: AccountingCode[];
  contracts: Contract[];
  values: VacancyDetailsFormData;
  setFieldValue: (
    field: any,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setVacancy: React.Dispatch<React.SetStateAction<VacancyDetailsFormData>>;
  readOnly: boolean;
  vacancyExists: boolean;
};

export const VacancyDetailSection: React.FC<Props> = props => {
  const {
    values,
    positionTypes,
    orgId,
    locations,
    setFieldValue,
    setVacancy,
    contracts,
    payCodes,
    accountingCodes,
    readOnly,
    vacancyExists,
  } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  const [isSelectDatesOpen, setIsSelectDatesOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  const positionTypeOptions = useMemo(
    () =>
      positionTypes
        ? positionTypes.map((r: any) => ({ label: r.name, value: r.id }))
        : [],
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
    setVacancy(vacancy);
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

  const handleCloseDateDialog = () => {
    setMonth(new Date());
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

  //default properties
  useEffect(() => {
    if (
      !values.locationId ||
      !values.contractId ||
      !values.workDayScheduleId ||
      (values.title === undefined && positionTypes)
    ) {
      setFieldValue(
        "locationId",
        !values.locationId ? locationOptions[0].value : values.locationId
      );
      setFieldValue(
        "contractId",
        !values.contractId ? contracts[0].id : values.contractId
      );
      setFieldValue(
        "workDayScheduleId",
        !values.workDayScheduleId
          ? bellScheduleOptions[0].value
          : values.workDayScheduleId
      );
      setFieldValue(
        "title",
        !values.title
          ? positionTypes.find(pt => pt.id === values.positionTypeId)?.name ??
              ""
          : values.title
      );
      const model = {
        locationId: !values.locationId
          ? locationOptions[0].value
          : values.locationId,
        contractId: !values.contractId ? contracts[0].id : values.contractId,
        workDayScheduleId: !values.workDayScheduleId
          ? bellScheduleOptions[0].value
          : values.workDayScheduleId,
        title: !values.title
          ? positionTypes.find(pt => pt.id === values.positionTypeId)?.name ??
            ""
          : values.title,
      };
      updateModel(model);
    }
  }, [values]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <>
      <SelectVacancyDateDialog
        open={isSelectDatesOpen}
        onClose={handleCloseDateDialog}
        onSetDates={toggleVacancyDate}
        contractId={values.contractId}
        vacancyDates={values.details.map((d: VacancyDetailInput) => d.date)}
        currentMonth={month}
        onMonthChange={setMonth}
      />

      <Typography variant="h6">{t("Vacancy Details")}</Typography>
      <Grid container justify="space-between">
        <Grid item xs={12} className={classes.rowContainer}>
          {!readOnly && !vacancyExists && (
            <Select
              placeholder={t("Please select a Postion type")}
              value={{
                value: values.positionTypeId ?? "",
                label:
                  positionTypeOptions.find(
                    (a: any) => a.value === values.positionTypeId
                  )?.label || "",
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
                const contractId = positionTypes
                  ? positionTypes.find(pt => pt.id === selectedValue)
                      ?.defaultContractId ?? ""
                  : "";

                const title = positionTypes
                  ? `${positionTypes.find(pt => pt.id === selectedValue)
                      ?.name ?? ""} ${t("Vacancy")}`
                  : "";

                setFieldValue("contractId", contractId);

                setFieldValue("title", title);

                updateModel({
                  positionTypeId: selectedValue,
                  contractId: contractId,
                  title: title,
                });
              }}
              withResetValue={false}
            ></Select>
          )}
          {(readOnly || vacancyExists) && (
            <>
              <Typography variant="h6">{t("Position type")}</Typography>
              <Typography>
                {
                  positionTypeOptions.find(
                    a => a.value === values.positionTypeId
                  )?.label
                }
              </Typography>
            </>
          )}
        </Grid>
        {values.positionTypeId !== "" && (
          <Grid item container xs={12} className={classes.rowContainer}>
            <Grid item xs={12}>
              {!readOnly && !vacancyExists && (
                <Input
                  label={t("Title")}
                  placeholder={t("Enter a title for the vacancy")}
                  value={values.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updateModel({ title: e.target.value });
                    setFieldValue("title", e.target.value);
                  }}
                />
              )}
              {(readOnly || vacancyExists) && (
                <>
                  <Typography variant="h6">{t("Title")}</Typography>
                  <Typography>{values.title}</Typography>
                </>
              )}
            </Grid>
          </Grid>
        )}
        {values.positionTypeId !== "" && contracts && (
          <Grid item xs={12} className={classes.rowContainer}>
            <VacancyContractSelect
              contracts={contracts}
              selectedContractId={values.contractId}
              setFieldValue={setFieldValue}
              updateModel={updateModel}
              readOnly={readOnly}
              vacancyExists={vacancyExists}
            />
          </Grid>
        )}

        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            {!readOnly && !vacancyExists && (
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
                  setFieldValue("workDayScheduleId", "");

                  updateModel({
                    locationId: selectedValue,
                    workDayScheduleId: "",
                  });
                }}
              ></Select>
            )}
            {(readOnly || vacancyExists) && (
              <>
                <Typography variant="h6">{t("Location")}</Typography>
                <Typography>
                  {locationOptions.find(
                    (a: any) => a.value === values.locationId
                  )?.label || locationOptions[0].label}
                </Typography>
              </>
            )}
          </Grid>
        )}

        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            {!readOnly && (
              <>
                <Select
                  value={{
                    value:
                      values.workDayScheduleId ?? bellScheduleOptions[0].value,
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
                <Divider variant="fullWidth" />
              </>
            )}
            {readOnly && (
              <>
                <Typography variant="h6">{t("Bell Schedule")}</Typography>
                <Typography>
                  {bellScheduleOptions.find(
                    (a: any) => a.value === values.workDayScheduleId
                  )?.label || bellScheduleOptions[0].label}
                </Typography>
              </>
            )}
          </Grid>
        )}

        {values.positionTypeId !== "" && (
          <Grid item container xs={12} className={classes.rowContainer}>
            <Grid item xs={8}>
              <label>Dates</label>
              <Typography>{buildDateLabel}</Typography>
            </Grid>
            {!readOnly && (
              <Grid item xs={4}>
                <Button
                  onClick={() => {
                    setIsSelectDatesOpen(true);
                  }}
                  variant="contained"
                >
                  {t("Select Dates")}
                </Button>
              </Grid>
            )}
          </Grid>
        )}

        {values.positionTypeId !== "" &&
          !readOnly &&
          payCodes &&
          locations &&
          accountingCodes && (
            <Grid item xs={12} className={classes.rowContainer}>
              <VacancyIndividualDayList
                vacancyDays={values.details}
                payCodes={payCodes}
                defaultPayCodeId={
                  positionTypes.find(pt => pt.id === values.positionTypeId)
                    ?.payCodeId ?? undefined
                }
                accountingCodes={accountingCodes}
                workDayScheduleVariant={locations
                  .find(l => l.id === values.locationId)
                  ?.workDaySchedules.find(
                    w => w.id === values.workDayScheduleId
                  )
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
    "& hr": {
      marginTop: theme.typography.pxToRem(30),
      marginBottom: theme.typography.pxToRem(10),
      border: "1px solid  #d8d8d8",
    },
  },
}));
