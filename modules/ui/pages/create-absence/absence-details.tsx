import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { DayPart, FeatureFlag } from "graphql/server-types.gen";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { DatePicker, DatePickerOnChange } from "ui/components/form/date-picker";
import { Select } from "ui/components/form/select";
import { CreateAbsenceActions, CreateAbsenceState } from "./state";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";

type Props = {
  state: CreateAbsenceState;
  dispatch: React.Dispatch<CreateAbsenceActions>;
};

export const AbsenceDetails: React.FC<Props> = ({ state, dispatch }) => {
  const classes = useStyles();
  const { t } = useTranslation();
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
    ({ startDate, endDate }) => {
      console.log("dates changed", startDate, endDate);
      // dispatch({ action: "selectDates", startDate, endDate });
    },
    [dispatch]
  );
  const onReasonChange = React.useCallback(() => {}, [dispatch]);

  const onDayPartChange = React.useCallback(
    event => {
      dispatch({
        action: "selectAbsenceTimeType",
        dayPart: event.target.value,
      });
    },
    [dispatch]
  );
  return (
    <Grid container>
      <Grid item md={4}>
        <Typography variant="h5">{t("Time")}</Typography>
        <DatePicker
          startDate={state.startDate}
          endDate={state.endDate}
          onChange={onDateChange}
          startLabel={t("From")}
          endLabel={t("To")}
        />

        <RadioGroup
          aria-label="time"
          name="time"
          value={state.dayPart || ""} // TODO "" should not be passed into the mutation
          onChange={onDayPartChange}
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
      </Grid>
      <Grid item md={8}>
        <Typography variant="h5">{t("Reason")}</Typography>
        <Typography>{t("Select a reason")}</Typography>
        <Select
          value={null}
          options={absenceReasonOptions}
          label={t("Reason")}
          onChange={onReasonChange}
        ></Select>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.actionButtons}>
          <Button variant="contained">{t("Create")}</Button>
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
