import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { SetValue } from "forms";
import {
  DayPart,
  FeatureFlag,
  NeedsReplacement,
} from "graphql/server-types.gen";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { DatePicker, DatePickerOnChange } from "ui/components/form/date-picker";
import { Select } from "ui/components/form/select";
import { CreateAbsenceState } from "./state";
import { FormData } from "./ui";

type Props = {
  state: CreateAbsenceState;
  setValue: SetValue;
  values: FormData;
  isAdmin: null | boolean;
  needsReplacement: null | NeedsReplacement;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const textFieldClasses = useTextFieldClasses();
  const { t } = useTranslation();
  const { state, setValue, values } = props;

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

  const onNotesChange = React.useCallback(
    async event => {
      await setValue("notes", event.target.value);
    },
    [setValue]
  );

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
          onChange={onNotesChange}
          InputProps={{ classes: textFieldClasses }}
        />
      </Grid>

      <Grid item md={8}>
        <Typography variant="h5">{t("Substitute Details")}</Typography>
      </Grid>

      <Grid item xs={12}>
        <div className={classes.actionButtons}>
          <Button type="submit" variant="contained">
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
