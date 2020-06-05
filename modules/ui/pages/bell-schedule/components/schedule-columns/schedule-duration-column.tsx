import * as React from "react";
import {
  Period,
  GetPeriodDurationInMinutes,
  travelDurationFromPeriods,
} from "../../helpers";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  periods: Period[];
  scheduleClasses: any;
};

export const ScheduleDurationColumn: React.FC<Props> = props => {
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

        const travelDuration = travelDurationFromPeriods(props.periods, p, i);

        return (
          <div key={p.periodId ?? i} className={periodClasses.join(" ")}>
            {!p.skipped && (
              <div className={classes.duration}>
                {GetPeriodDurationInMinutes(
                  p.startTime,
                  p.endTime,
                  travelDuration,
                  i < props.periods.length - 1 && travelDuration > 0,
                  t
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  duration: {
    width: theme.typography.pxToRem(125),
  },
}));
