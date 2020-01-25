import * as React from "react";
import {
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Divider,
  Checkbox,
} from "@material-ui/core";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { PeriodUI } from "./period";
import { Period, Schedule, buildNewPeriod } from "./helpers";
import { DayOfWeek } from "graphql/server-types.gen";

type Props = {
  index: number;
  multipleSchedules: boolean;
  lastSchedule: boolean;
  onDelete: () => void;
  onCheckScheduleVaries: () => void;
  schedule: Schedule;
  locationOptions: OptionType[];
  bellScheduleOptions: OptionType[];
  onAddSchool: () => void;
  onRemoveSchool: (periodNumber: number) => void;
};

export const ScheduleUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const scheduleNumber = ` #${props.index + 1}`;

  const periods = props.schedule.periods;
  const daysOfTheWeek = props.schedule.daysOfTheWeek;

  return (
    <>
      <Grid container spacing={2}>
        {props.multipleSchedules && (
          <Grid container item spacing={2} justify="space-between">
            <Grid item>
              <div className={classes.headingText}>{`${t(
                "Schedule"
              )}${scheduleNumber}`}</div>
            </Grid>
            <Grid item>
              <TextButton
                className={classes.redLink}
                onClick={() => props.onDelete()}
              >
                {`${t("Delete schedule")}${scheduleNumber}`}
              </TextButton>
            </Grid>
          </Grid>
        )}
        <Grid
          container
          item
          xs={12}
          className={classes.shadedContainer}
          spacing={2}
        >
          <Grid item xs={12}>
            <div className={classes.daysOfWeekContainer}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Sunday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Sunday")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Monday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Monday")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Tuesday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Tuesday")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Wednesday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Wednesday")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Thursday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Thursday")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Friday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Friday")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={
                      daysOfTheWeek.find(x => x === DayOfWeek.Saturday)
                        ? true
                        : false
                    }
                    onChange={e => {
                      console.log(e.target.checked);
                    }}
                  />
                }
                label={t("Saturday")}
              />
            </div>
          </Grid>
          <Grid item xs={12}>
            {periods.map((p, i) => {
              return (
                <>
                  {i != 0 && <Divider key={i} className={classes.divider} />}
                  <PeriodUI
                    key={i}
                    index={i}
                    locationOptions={props.locationOptions}
                    bellScheduleOptions={props.bellScheduleOptions}
                    allDay={periods.length === 1}
                    allDayDisabled={periods.length > 1}
                    period={p}
                    lastPeriod={periods.length === i + 1}
                    onRemoveSchool={props.onRemoveSchool}
                    onAddSchool={props.onAddSchool}
                    scheduleNumber={scheduleNumber}
                  />
                </>
              );
            })}
          </Grid>
        </Grid>
        {props.index === 0 && (
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={props.multipleSchedules}
                  onChange={e => {
                    if (!props.multipleSchedules) {
                      props.onCheckScheduleVaries();
                    }
                  }}
                />
              }
              label={t("Schedule varies by day of the week")}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedContainer: {
    backgroundColor: "#F5F5F5",
    marginLeft: theme.spacing(1),
  },
  redLink: {
    color: theme.customColors.darkRed,
    textDecoration: "underline",
  },
  headingText: {
    fontSize: theme.typography.pxToRem(16),
    fontStyle: "bold",
  },
  divider: {
    color: theme.customColors.gray,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  daysOfWeekContainer: {
    display: "flex",
  },
}));
