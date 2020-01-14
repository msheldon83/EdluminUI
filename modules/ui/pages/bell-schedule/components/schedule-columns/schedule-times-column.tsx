import { makeStyles } from "@material-ui/core";
import { addMinutes, isValid } from "date-fns";
import { FormikErrors } from "formik";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { GetError, Period } from "../../helpers";

type Props = {
  periods: Period[];
  travelDuration: number;
  setFieldValue: Function;
  errors: FormikErrors<{ periods: Period[] }>;
  scheduleClasses: any;
};

export const ScheduleTimesColumn: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      {props.periods.map((p, i) => {
        const periodClasses = [props.scheduleClasses.period];
        if (i % 2 === 1) {
          periodClasses.push(props.scheduleClasses.alternatingItem);
        }
        if (p.skipped) {
          periodClasses.push(props.scheduleClasses.skippedPeriod);
        }

        // Determining valid start times for Periods
        const priorPeriodEndTime =
          i > 0 && props.periods[i - 1].endTime
            ? props.periods[i - 1].endTime
            : undefined;
        const earliestStartTime =
          priorPeriodEndTime && isValid(new Date(priorPeriodEndTime))
            ? addMinutes(
                new Date(priorPeriodEndTime),
                props.travelDuration
              ).toISOString()
            : undefined;

        const startTimeError = GetError(props.errors, "startTime", i);
        const endTimeError = GetError(props.errors, "endTime", i);

        return (
          <div key={i} className={periodClasses.join(" ")}>
            {p.skipped && (
              <div className={classes.skippedDiv}>{t("Skipped")}</div>
            )}
            {!p.skipped && (
              <>
                <div className={classes.timeInput}>
                  <FormikTimeInput
                    label=""
                    name={`periods[${i}].startTime`}
                    value={p.startTime || undefined}
                    earliestTime={earliestStartTime}
                    inputStatus={startTimeError ? "error" : "default"}
                    validationMessage={startTimeError}
                  />
                </div>
                <div className={classes.timeInput}>
                  <FormikTimeInput
                    label=""
                    name={`periods[${i}].endTime`}
                    value={p.endTime || undefined}
                    earliestTime={p.startTime || earliestStartTime}
                    inputStatus={endTimeError ? "error" : "default"}
                    validationMessage={endTimeError}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  timeInput: {
    width: theme.typography.pxToRem(100),
    margin: theme.spacing(),
  },
  skippedDiv: {
    flexGrow: 2,
    textTransform: "uppercase",
  },
}));
