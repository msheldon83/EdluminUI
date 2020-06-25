import { makeStyles } from "@material-ui/core";
import { addMinutes, isValid, parseISO, format } from "date-fns";
import { FormikErrors } from "formik";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { GetError, Period } from "../../helpers";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

type Props = {
  periods: Period[];
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

        const hasStartTime = p.startTime && isValid(new Date(p.startTime));
        const hasPriorPerionEndTime =
          priorPeriodEndTime && isValid(new Date(priorPeriodEndTime));

        const earliestStartTime = hasPriorPerionEndTime
          ? new Date(priorPeriodEndTime!).toISOString()
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
                <Can do={[PermissionEnum.ScheduleSettingsSave]}>
                  <div className={classes.timeInput}>
                    <FormikTimeInput
                      label=""
                      name={`periods[${i}].startTime`}
                      value={p.startTime || undefined}
                      earliestTime={earliestStartTime}
                      inputStatus={startTimeError ? "error" : "default"}
                      validationMessage={startTimeError}
                      highlightOnFocus
                      inputProps={{
                        /*
                          These inputs should come after the period name inputs in
                          tab order.

                          - props.periods.length starts that tab order after the period
                            name inputs
                          - The rest of the calculation is as follows
                            - Multiple the number of inputs by the index of the set in the list,
                              then add the number of the input in the pair (not confusing at all)
                              - Period 1 (index is 0): 2 * 0 + 1 = 1 --- 2 * 0 + 2 = 2
                              - Period 2 (index is 1): 2 * 1 + 1 = 3 --- 2 * 1 + 2 = 4
                              - Period 3 (index is 2): 2 * 2 + 1 = 5 --- 2 * 2 + 2 = 6
                        */
                        tabIndex: props.periods.length + (2 * i + 1),
                      }}
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
                      highlightOnFocus
                      inputProps={{
                        tabIndex: props.periods.length + (2 * i + 2),
                      }}
                    />
                  </div>
                </Can>
                <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
                  <div className={classes.timeDisplay}>
                    {p.startTime ? format(parseISO(p.startTime), "h:mm a") : ""}
                  </div>
                  <div className={classes.timeDisplay}>
                    {p.endTime ? format(parseISO(p.endTime), "h:mm a") : ""}
                  </div>
                </Can>
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
  timeDisplay: {
    width: theme.typography.pxToRem(100),
  },
  skippedDiv: {
    flexGrow: 2,
    textTransform: "uppercase",
  },
}));
