import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Button } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { EmployeeAbsenceDetail } from "..";
import { isEqual, format } from "date-fns";
import { DayIcon } from "ui/components/day-icon";
import { parseDayPortion } from "ui/components/helpers";

type Props = {
  absences: EmployeeAbsenceDetail[];
  cancelAbsence: (absenceId: string) => Promise<void>;
};

export const ScheduledAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section>
      <SectionHeader title={t("Scheduled absences")} />
      <Grid container>
        {props.absences.map((a, i) => {
          const className = [
            classes.detail,
            i % 2 == 1 ? classes.shadedRow : undefined,
          ].join(" ");

          const dateRangeDisplay = isEqual(a.startDate, a.endDate)
            ? format(a.startDate, "MMM d")
            : `${format(a.startDate, "MMM d")} - ${format(a.endDate, "MMM d")}`;

          const dayPortionNumberDisplay = Math.round(a.totalDayPortion);
          const dayPortionDisplay =
            dayPortionNumberDisplay >= 1
              ? `${dayPortionNumberDisplay} ${parseDayPortion(
                  t,
                  a.totalDayPortion
                )}`
              : parseDayPortion(t, a.totalDayPortion);

          return (
            <Grid item container xs={12} key={i} className={className}>
              <Grid item xs={3}>
                <div>{a.absenceReason}</div>
                <div className={classes.subText}>{dateRangeDisplay}</div>
              </Grid>
              <Grid item xs={3}>
                {a.substitute ? (
                  <>
                    <div>{a.substitute?.name}</div>
                    <div className={classes.subText}>
                      {a.substitute?.phoneNumber}
                    </div>
                  </>
                ) : (
                  <div className={classes.subText}>
                    {t("No substitute assigned")}
                  </div>
                )}
              </Grid>
              <Grid item xs={3}>
                <div className={classes.dayPartContainer}>
                  <DayIcon
                    dayPortion={a.totalDayPortion}
                    startTime={a.startTimeLocal.toString()}
                  />
                  <div className={classes.dayPart}>
                    <div>{dayPortionDisplay}</div>
                    <div className={classes.subText}>
                      {`${a.startTime} - ${a.endTime}`}
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={1}>
                <div>{`#${a.id}`}</div>
              </Grid>
              <Grid item xs={2} className={classes.cancelButtonContainer}>
                <Button
                  variant="outlined"
                  onClick={async () => await props.cancelAbsence(a.id)}
                  className={classes.cancelButton}
                >
                  {t("Cancel")}
                </Button>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  subText: {
    color: theme.customColors.edluminSubText,
    fontWeight: "normal",
  },
  detail: {
    padding: theme.spacing(2),
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  dayPartContainer: {
    display: "flex",
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
  cancelButtonContainer: {
    textAlign: "right",
  },
  cancelButton: {
    color: theme.palette.error.main,
  },
}));
