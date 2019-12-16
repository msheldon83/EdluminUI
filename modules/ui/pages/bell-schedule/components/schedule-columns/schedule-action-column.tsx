import * as React from "react";
import { Period, RemovePeriod, SkipPeriod, UnskipPeriod } from "../../helpers";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { CancelOutlined, Add } from "@material-ui/icons";

type Props = {
  periods: Period[];
  isStandard: boolean;
  minNumberOfPeriods: number;
  setPeriods: (periods: Period[]) => void;
  scheduleClasses: any;
};

export const ScheduleActionColumn: React.FC<Props> = props => {
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
            <div className={classes.actionDiv}>
              {props.periods.length > props.minNumberOfPeriods && (
                <div className={classes.action}>
                  {!p.skipped &&
                    props.periods.filter(pf => !pf.skipped).length >
                      props.minNumberOfPeriods && (
                      <CancelOutlined
                        onClick={() => {
                          const updatedPeriods = props.isStandard
                            ? RemovePeriod(props.periods, i, t)
                            : SkipPeriod(props.periods, i);
                          props.setPeriods(updatedPeriods);
                        }}
                      />
                    )}
                  {p.skipped && (
                    <Add
                      onClick={() => {
                        const updatedPeriods = UnskipPeriod(props.periods, i);
                        props.setPeriods(updatedPeriods);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  actionDiv: {
    width: theme.typography.pxToRem(50),
  },
  action: {
    cursor: "pointer",
    color: "initial",
  },
}));
