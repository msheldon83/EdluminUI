import * as React from "react";
import * as uuid from "uuid";
import { Select, OptionType } from "ui/components/form/select";
import {
  PositionType,
  Location as Loc,
  Contract,
  VacancyDetailInput,
  PayCode,
  AccountingCode,
  VacancyReason,
  PermissionEnum,
} from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { sortBy } from "lodash-es";
import { VacancyContractSelect } from "./vacancy-contract-select";
import { OptionTypeBase } from "react-select";
import {
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { startOfDay, addDays, format } from "date-fns";
import { isSameDay } from "date-fns/esm";
import { find } from "lodash-es";
import { VacancyIndividualDayList } from "./vacancy-individual-day-list";
import { SelectVacancyDateDialog } from "./vacancy-date-picker-dialog";
import { Input } from "ui/components/form/input";
import { VacancyDetailsFormData } from "../helpers/types";
import { getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates } from "ui/components/date-helpers";
import { Can } from "ui/components/auth/can";
import { LocationLink } from "ui/components/links/locations";

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
  }, [locations, values.locationId, locationOptions]);

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
        newDetails.push({ date: d, id: uuid.v4() });
      }
    });
    newDetails.sort((a, b) => a.date.getTime() - b.date.getTime());

    setFieldValue("details", newDetails);
    updateModel({ details: newDetails });
    setIsSelectDatesOpen(false);
  };

  const handleCloseDateDialog = () => {
    setMonth(new Date());
    setIsSelectDatesOpen(false);
  };

  const buildDateLabel = React.useMemo(() => {
    const sortedDates = sortBy(values.details, d => {
      return d.date;
    });
    const label = getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates(
      sortedDates.map(d => d.date),
      undefined,
      false
    );
    return label;
  }, [values.details]);

  //default properties
  useEffect(
    () => {
      if (
        !values.locationId ||
        !values.locationName ||
        !values.contractId ||
        !values.workDayScheduleId ||
        (values.title === undefined && positionTypes)
      ) {
        if (locationOptions[0]?.value) {
          setFieldValue(
            "locationId",
            !values.locationId ? locationOptions[0].value : values.locationId
          );
        }

        if (locationOptions[0]?.label) {
          setFieldValue(
            "locationName",
            !values.locationName
              ? locationOptions[0].label
              : values.locationName
          );
        }

        if (contracts[0]?.id) {
          setFieldValue(
            "contractId",
            !values.contractId ? contracts[0]?.id : values.contractId
          );
        }

        if (bellScheduleOptions[0]?.value) {
          setFieldValue(
            "workDayScheduleId",
            !values.workDayScheduleId
              ? bellScheduleOptions[0]?.value
              : values.workDayScheduleId
          );
        }

        setFieldValue(
          "title",
          !values.title
            ? positionTypes.find(pt => pt.id === values.positionTypeId)?.name ??
                ""
            : values.title
        );
        const model = {
          locationId: !values.locationId
            ? locationOptions[0]?.value
            : values.locationId,
          locationName: !values.locationName
            ? locationOptions[0]?.label
            : values.locationName,
          contractId: !values.contractId ? contracts[0]?.id : values.contractId,
          workDayScheduleId: !values.workDayScheduleId
            ? bellScheduleOptions[0]?.value
            : values.workDayScheduleId,
          title: !values.title
            ? positionTypes.find(pt => pt.id === values.positionTypeId)?.name ??
              ""
            : values.title,
        };
        updateModel(model);
      }
    },
    /* eslint-disable-line react-hooks/exhaustive-deps */ [
      values.locationId,
      values.locationName,
      values.contractId,
      values.workDayScheduleId,
      values.title,
    ]
  );

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
              {!readOnly && (
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
              {readOnly && (
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
                  value: values.locationId ?? "",
                  label:
                    locationOptions.find(
                      (a: any) => a.value === values.locationId
                    )?.label ?? "",
                }}
                options={locationOptions}
                multiple={false}
                label={t("Location")}
                withResetValue={false}
                onChange={async (e: OptionType) => {
                  let selectedValue: any = null;
                  let selectedLabel: any = null;
                  if (e) {
                    selectedValue = (e as OptionTypeBase).value;
                    selectedLabel = (e as OptionTypeBase).label;
                  }
                  setFieldValue("locationId", selectedValue);
                  setFieldValue("locationName", selectedLabel);
                  setFieldValue("workDayScheduleId", "");

                  updateModel({
                    locationId: selectedValue,
                    locationName: selectedLabel,
                    workDayScheduleId: "",
                  });
                }}
              ></Select>
            )}
            {(readOnly || vacancyExists) && (
              <>
                <Typography variant="h6">{t("Location")}</Typography>
                <Typography>
                  <LocationLink
                    orgId={props.orgId}
                    locationId={values.locationId}
                    color="black"
                  >
                    {locationOptions.find(
                      (a: any) => a.value === values.locationId
                    )?.label || locationOptions[0].label}
                  </LocationLink>
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
                    value: values.workDayScheduleId ?? "",
                    label:
                      bellScheduleOptions.find(
                        (a: any) => a.value === values.workDayScheduleId
                      )?.label ?? "",
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
              </>
            )}
            {readOnly && (
              <>
                <Typography variant="h6">{t("Bell Schedule")}</Typography>
                <Typography>
                  {
                    bellScheduleOptions.find(
                      (a: any) => a.value === values.workDayScheduleId
                    )?.label
                  }
                </Typography>
              </>
            )}
          </Grid>
        )}

        {values.positionTypeId !== "" && (
          <Grid item xs={12} className={classes.rowContainer}>
            {!readOnly && (
              <>
                <label>{t("Administrator comments")}</label>
                <Typography className={classes.subText}>
                  {t("Can be seen and edited by administrators only.")}
                </Typography>
                <TextField
                  multiline={true}
                  value={values.adminOnlyNotes}
                  fullWidth={true}
                  placeholder={t("Enter administrative notes")}
                  variant="outlined"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updateModel({ adminOnlyNotes: e.target.value });
                    setFieldValue("adminOnlyNotes", e.target.value);
                  }}
                />
                <Divider variant="fullWidth" />
              </>
            )}
            {readOnly && (
              <>
                <Typography variant="h6">
                  {t("Administrator comments")}
                </Typography>
                <Typography className={classes.subText}>
                  {t("Can be seen and edited by administrators only.")}
                </Typography>
                <Typography>
                  {values.adminOnlyNotes || (
                    <span className={classes.valueMissing}>
                      {t("No Notes Specified")}
                    </span>
                  )}
                </Typography>
              </>
            )}
          </Grid>
        )}

        {values.positionTypeId !== "" &&
          values.contractId !== "" &&
          values.locationId !== "" &&
          values.workDayScheduleId !== "" && (
            <Grid item container xs={12} className={classes.rowContainer}>
              <Grid item xs={8}>
                <label>Dates</label>
                <Typography>{buildDateLabel}</Typography>
              </Grid>
              {!readOnly && (
                <Grid item xs={4}>
                  <Can do={[PermissionEnum.AbsVacSave]}>
                    <Button
                      className={classes.selectDateButton}
                      onClick={() => {
                        setIsSelectDatesOpen(true);
                      }}
                      variant="contained"
                    >
                      {t("Select Dates")}
                    </Button>
                  </Can>
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
  subText: {
    color: theme.customColors.edluminSubText,
    marginBottom: theme.typography.pxToRem(10),
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
  selectDateButton: {
    marginLeft: theme.typography.pxToRem(10),
  },
}));
