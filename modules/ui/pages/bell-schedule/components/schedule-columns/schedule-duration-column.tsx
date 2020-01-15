import * as React from "react";
import { Period, GetPeriodDurationInMinutes } from "../../helpers";
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

        return (
          <div key={i} className={periodClasses.join(" ")}>
            {!p.skipped && (
              <div className={classes.duration}>
                {GetPeriodDurationInMinutes(
                  p.startTime,
                  p.endTime,
                  p.travelDuration,
                  i < props.periods.length - 1 && p.travelDuration > 0,
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
