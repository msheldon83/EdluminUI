import * as React from "react";
import {
  Grid,
  makeStyles,
  FormControlLabel,
  Divider,
  Checkbox,
  IconButton,
} from "@material-ui/core";
import { OptionType } from "ui/components/form/select-new";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { PeriodUI, BellSchedule } from "./period";
import { Schedule } from "./helpers";
import { DayOfWeek } from "graphql/server-types.gen";
import InfoIcon from "@material-ui/icons/Info";
import { FormikErrors } from "formik";
import { DayOfWeekSelector } from "ui/components/day-of-week-selector";

type Props = {
  index: number;
  multipleSchedules: boolean;
  lastSchedule: boolean;
  onDelete: () => void;
  onCheckScheduleVaries: () => void;
  onAddSchedule: () => void;
  schedule: Schedule;
  locationOptions: OptionType[];
  bellSchedules: BellSchedule[];
  onAddSchool: () => void;
  onRemoveSchool: (periodNumber: number) => void;
  disabledDaysOfWeek: DayOfWeek[];
  onCheckDayOfWeek: (dow: DayOfWeek) => void;
  onChangeLocation: (locationId: string, index: number) => void;
  onChangeBellSchedule: (bellScheduleId: string, index: number) => void;
  onChangeStartPeriod: (startPeriodId: string, index: number) => void;
  onChangeEndPeriod: (endPeriodId: string, index: number) => void;
  onCheckAllDay: (allDay: boolean) => void;
  errors: FormikErrors<{ schedules: Schedule[] }>;
};

export const ScheduleUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const scheduleNumber = ` #${props.index + 1}`;

  const periods = props.schedule.periods;

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
            <DayOfWeekSelector
              daysOfWeek={props.schedule.daysOfTheWeek}
              disabledDaysOfWeek={props.disabledDaysOfWeek}
              onCheckDayOfWeek={props.onCheckDayOfWeek}
            />
          </Grid>
          <Grid item xs={12}>
            {periods.map((p, i) => {
              return (
                <div key={`div-schedule${props.index}period${i}`}>
                  {i != 0 && <Divider className={classes.divider} />}
                  <PeriodUI
                    index={i}
                    locationOptions={props.locationOptions}
                    bellSchedules={props.bellSchedules}
                    disableAllDay={periods.length > 1}
                    period={p}
                    lastPeriod={periods.length === i + 1}
                    onRemoveSchool={props.onRemoveSchool}
                    onAddSchool={props.onAddSchool}
                    scheduleNumber={scheduleNumber}
                    scheduleIndex={props.index}
                    onChangeLocation={props.onChangeLocation}
                    onChangeBellSchedule={props.onChangeBellSchedule}
                    onCheckAllDay={props.onCheckAllDay}
                    onChangeStartPeriod={props.onChangeStartPeriod}
                    onChangeEndPeriod={props.onChangeEndPeriod}
                    errors={props.errors}
                  />
                </div>
              );
            })}
          </Grid>
        </Grid>
        {props.index === 0 ? (
          <Grid item>
            <div className={classes.daysOfWeekContainer}>
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
              <IconButton
                onClick={() => {
                  window.open(
                    "https://help.redroverk12.com/hc/en-us/articles/360039620212-How-to-Build-or-Adjust-a-Traveling-Teacher-s-Schedule",
                    "_blank"
                  );
                }}
              >
                <InfoIcon />
              </IconButton>
            </div>
          </Grid>
        ) : (
          <Grid item>
            <TextButton color="primary" onClick={() => props.onAddSchedule()}>
              {t("Add another schedule")}
            </TextButton>
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
