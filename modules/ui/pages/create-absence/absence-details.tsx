import {
  Button,
  Checkbox,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Typography,
  Chip,
} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { addMonths, endOfMonth, format, parseISO, startOfDay } from "date-fns";
import { eachDayOfInterval } from "date-fns/esm";
import { SetValue } from "forms";
import { HookQueryResult, useQueryBundle } from "graphql/hooks";
import {
  CalendarDayType,
  DayPart,
  FeatureFlag,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import {
  DatePicker,
  DatePickerOnChange,
  DatePickerOnMonthChange,
} from "ui/components/form/date-picker";
import { Select } from "ui/components/form/select";
import {
  GetEmployeeContractSchedule,
  GetEmployeeContractScheduleQuery,
  GetEmployeeContractScheduleQueryVariables,
} from "./graphql/get-contract-schedule.gen";
import { CreateAbsenceActions, CreateAbsenceState } from "./state";
import { FormData } from "./ui";
import { VacancyDetails } from "./vacancy-details";
import { useHistory } from "react-router";

type Props = {
  state: CreateAbsenceState;
  dispatch: React.Dispatch<CreateAbsenceActions>;
  setValue: SetValue;
  values: FormData;
  isAdmin: null | boolean;
  needsReplacement: NeedsReplacement;
  vacancies: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  create: (dates: Date[]) => Promise<string | undefined>;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();
  const history = useHistory();
  const {
    state,
    setValue,
    values,
    isAdmin,
    needsReplacement,
    dispatch,
  } = props;

  const contractSchedule = useQueryBundle(GetEmployeeContractSchedule, {
    variables: {
      id: state.employeeId,
      fromDate: format(addMonths(state.viewingCalendarMonth, -1), "yyyy-M-d"),
      toDate: format(
        endOfMonth(addMonths(state.viewingCalendarMonth, 2)),
        "yyyy-M-d"
      ),
    },
  });

  const disabledDates = useMemo(() => computeDisabledDates(contractSchedule), [
    contractSchedule,
  ]);

  const [showNotesForReplacement, setShowNotesForReplacement] = useState(
    needsReplacement !== NeedsReplacement.No
  );

  const absenceReasons = useAbsenceReasons(state.organizationId);
  const absenceReasonOptions = useMemo(
    () => absenceReasons.map(r => ({ label: r.name, value: r.id })),
    [absenceReasons]
  );
  const featureFlags = useOrgFeatureFlags(state.organizationId);
  const dayPartOptions = useMemo(
    () => featureFlagsToDayPartOptions(featureFlags),
    [featureFlags]
  );

  const onDateChange: DatePickerOnChange = React.useCallback(
    async ({ startDate, endDate }) => {
      await setValue("startDate", startDate);
      await setValue("endDate", endDate);
    },
    [setValue]
  );
  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
    },
    [setValue]
  );

  const onDayPartChange = React.useCallback(
    async event => {
      await setValue("dayPart", event.target.value);
    },
    [setValue]
  );

  const onNotesToApproverChange = React.useCallback(
    async event => {
      await setValue("notesToApprover", event.target.value);
    },
    [setValue]
  );
  const onNotesToReplacementChange = React.useCallback(
    async event => {
      await setValue("notesToReplacement", event.target.value);
    },
    [setValue]
  );

  const onNeedsReplacementChange = React.useCallback(
    async event => {
      setShowNotesForReplacement(event.target.checked);
      await setValue("needsReplacement", event.target.checked);
    },
    [setValue, setShowNotesForReplacement]
  );

  const onMonthChange: DatePickerOnMonthChange = React.useCallback(
    date => {
      dispatch({ action: "switchMonth", month: date });
    },
    [dispatch]
  );

  const removePrearrangedReplacementEmployee = async () => {
    await setValue("replacementEmployeeId", undefined);
    await setValue("replacementEmployeeName", undefined);
  };

  return (
    <Grid container>
      <Grid item md={4} className={classes.spacing}>
        <Typography variant="h5">{t("Absence Details")}</Typography>

        <div className={classes.select}>
          <Typography>{t("Select a reason")}</Typography>
          <Select
            value={{
              value: values.absenceReason,
              label:
                absenceReasonOptions.find(a => a.value === values.absenceReason)
                  ?.label || "",
            }}
            onChange={onReasonChange}
            options={absenceReasonOptions}
            isClearable={false}
            // label={t("Reason")}
          />
        </div>

        <DatePicker
          startDate={values.startDate}
          endDate={values.endDate}
          onChange={onDateChange}
          startLabel={t("From")}
          endLabel={t("To")}
          onMonthChange={onMonthChange}
          disableDates={disabledDates}
        />

        <RadioGroup
          onChange={onDayPartChange}
          aria-label="dayPart"
          className={classes.radioGroup}
        >
          {dayPartOptions.map(type => (
            <FormControlLabel
              key={type}
              value={type}
              control={<Radio />}
              label={t(dayPartToLabel(type))}
            />
          ))}
        </RadioGroup>

        <Typography variant="h6">{t("Notes for administration")}</Typography>
        <Typography className={classes.subText}>
          {t("Can be seen by the administrator and the employee.")}
        </Typography>

        <TextField
          multiline
          rows="6"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={onNotesToApproverChange}
          InputProps={{ classes: textFieldClasses }}
        />
      </Grid>

      <Grid item md={6}>
        <Typography className={classes.substituteDetailsTitle} variant="h5">
          {t("Substitute Details")}
        </Typography>
        <Typography className={classes.subText}>
          {t(
            "These times may not match your schedule exactly depending on district configuration."
          )}
        </Typography>

        <Paper>
          <div className={classes.container}>
            {isAdmin || needsReplacement === NeedsReplacement.Sometimes ? (
              <FormControlLabel
                label={t("Requires a substitute")}
                control={
                  <Checkbox
                    checked={values.needsReplacement}
                    onChange={onNeedsReplacementChange}
                  />
                }
              />
            ) : (
              <Typography className={classes.substituteRequiredText}>
                {needsReplacement === NeedsReplacement.Yes
                  ? t("Requires a substitute")
                  : t("No substitute required")}
              </Typography>
            )}

            {values.needsReplacement && (
              <VacancyDetails vacancies={props.vacancies} equalWidthDetails />
            )}

            {showNotesForReplacement && (
              <div className={classes.notesForReplacement}>
                <Typography variant="h6">
                  {t("Notes for substitute")}
                </Typography>
                <Typography
                  className={[
                    classes.subText,
                    classes.substituteDetailsSubtitle,
                  ].join(" ")}
                >
                  {t(
                    "Can be seen by the substitute, administrator and employee."
                  )}
                </Typography>
                <TextField
                  name="notesToReplacement"
                  multiline
                  rows="6"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  onChange={onNotesToReplacementChange}
                  InputProps={{ classes: textFieldClasses }}
                />
              </div>
            )}

            {values.replacementEmployeeId && (
              <div className={classes.preArrangedChip}>
                <Chip
                  label={`${t("Pre-arranged")}: ${
                    values.replacementEmployeeName
                  }`}
                  color={"primary"}
                  onDelete={async () => {
                    await removePrearrangedReplacementEmployee();
                  }}
                />
              </div>
            )}

            <div>
              {values.needsReplacement && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    history.push({
                      ...history.location,
                      search: "?action=assign",
                    });
                    props.dispatch({
                      action: "switchStep",
                      step: "assignSub",
                    });
                  }}
                >
                  {t("Pre-arrange")}
                </Button>
              )}
            </div>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <div className={classes.actionButtons}>
          <Button
            type="submit"
            variant="contained"
            onClick={async () => {
              const validDates = getValidDates(
                values.startDate,
                values.endDate,
                disabledDates
              );
              const absenceId = await props.create(validDates);
            }}
          >
            {t("Create")}
          </Button>
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  select: {
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.spacing(1),
  },
  radioGroup: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(3),
  },
  spacing: {
    paddingRight: theme.spacing(4),
  },
  subText: {
    color: theme.customColors.darkGray,
  },
  substituteDetailsTitle: { paddingBottom: theme.typography.pxToRem(3) },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  container: {
    padding: theme.spacing(2),
  },
  substituteRequiredText: {
    fontStyle: "italic",
  },
  notesForReplacement: {
    paddingTop: theme.spacing(3),
  },
  preArrangedChip: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));

const dayPartToLabel = (dayPart: DayPart): string => {
  switch (dayPart) {
    case DayPart.FullDay:
      return "Full Day";
    case DayPart.HalfDayMorning:
      return "Half Day AM";
    case DayPart.HalfDayAfternoon:
      return "Half Day PM";
    case DayPart.Hourly:
      return "Hourly";
    case DayPart.QuarterDayEarlyMorning:
      return "Quarter Day Early Morning";
    case DayPart.QuarterDayLateMorning:
      return "Quarter Day Late Morning";
    case DayPart.QuarterDayEarlyAfternoon:
      return "Quarter Day Early Afternoon";
    case DayPart.QuarterDayLateAfternoon:
      return "Quarter Day Late Afternoon";
    default:
      return "Other";
  }
};

const featureFlagsToDayPartOptions = (
  featureFlags: FeatureFlag[]
): DayPart[] => {
  const dayPartOptions: DayPart[] = [];
  featureFlags.map(a => {
    switch (a) {
      case FeatureFlag.FullDayAbsences:
        dayPartOptions.push(DayPart.FullDay);
        break;
      case FeatureFlag.HalfDayAbsences:
        dayPartOptions.push(DayPart.HalfDayAfternoon);
        dayPartOptions.push(DayPart.HalfDayMorning);
        break;
      case FeatureFlag.QuarterDayAbsences:
        dayPartOptions.push(DayPart.QuarterDayEarlyAfternoon);
        dayPartOptions.push(DayPart.QuarterDayLateAfternoon);
        dayPartOptions.push(DayPart.QuarterDayEarlyMorning);
        dayPartOptions.push(DayPart.QuarterDayLateMorning);
        break;
      case FeatureFlag.HourlyAbsences:
        dayPartOptions.push(DayPart.Hourly);
        break;
      case FeatureFlag.None:
      default:
        break;
    }
  });
  return dayPartOptions;
};

const computeDisabledDates = (
  queryResult: HookQueryResult<
    GetEmployeeContractScheduleQuery,
    GetEmployeeContractScheduleQueryVariables
  >
) => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates = new Set<Date>();
  queryResult.data.employee?.employeeContractSchedule?.forEach(contractDate => {
    switch (contractDate?.calendarDayTypeId) {
      case CalendarDayType.CancelledDay:
      case CalendarDayType.Invalid:
      case CalendarDayType.NonWorkDay: {
        const theDate = startOfDay(parseISO(contractDate.date));
        dates.add(theDate);
      }
    }
  });
  queryResult.data.employee?.employeeAbsenceSchedule?.forEach(absence => {
    const startDate = absence?.startDate;
    const endDate = absence?.endDate;
    if (startDate && endDate) {
      eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      }).forEach(day => {
        dates.add(startOfDay(day));
      });
    }
  });
  return [...dates];
};

const getValidDates = (
  startDate: Date,
  endDate: Date,
  disabledDates: Date[]
) => {
  const allDates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  const validDates = allDates.filter(x => !disabledDates.includes(x));
  return validDates;
};
