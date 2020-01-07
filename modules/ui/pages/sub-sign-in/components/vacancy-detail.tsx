import { Grid, InputLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  VacancyDetail,
  AbsenceReasonTrackingTypeId,
  DayConversion,
} from "graphql/server-types.gen";
import { parseISO, format } from "date-fns";
import { minutesToHours, hoursToMinutes } from "ui/components/helpers";

type Props = {
  vacancyDetail: Pick<
    VacancyDetail,
    | "id"
    | "startTimeLocal"
    | "endTimeLocal"
    | "assignment"
    | "vacancy"
    | "dayPortion"
    | "totalDayPortion"
    | "actualDuration"
    | "payDurationOverride"
    | "payTypeId"
  >;
  shadeRow: boolean;
  vacancyDayConversions: Pick<
    DayConversion,
    "name" | "maxMinutes" | "dayEquivalent"
  >[];
};

export const VacancyDetailRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const vacancyDetail = props.vacancyDetail;

  const vacancyDetailStartTime = parseISO(vacancyDetail.startTimeLocal);
  const vacancyDetailEndTime = parseISO(vacancyDetail.endTimeLocal);

  // Make sure the dayConversionName is initially set
  const dayConversionName = useMemo(() => {
    if (
      !vacancyDetail.dayPortion ||
      vacancyDetail.payTypeId === AbsenceReasonTrackingTypeId.Hourly
    ) {
      return props.vacancyDayConversions.find(
        x => x.name === AbsenceReasonTrackingTypeId.Hourly
      )?.name;
    }

    const matchByDayPortion = props.vacancyDayConversions.find(
      x => x.dayEquivalent === vacancyDetail.dayPortion
    );
    if (matchByDayPortion) {
      return props.vacancyDayConversions.find(
        x => x.name === matchByDayPortion.name
      )?.name;
    }
    return props.vacancyDayConversions.find(
      x => x.name === AbsenceReasonTrackingTypeId.Hourly
    )?.name;
  }, [
    props.vacancyDayConversions,
    vacancyDetail.dayPortion,
    vacancyDetail.payTypeId,
  ]);

  const matchByDayPortion = props.vacancyDayConversions.find(
    x => x.dayEquivalent === vacancyDetail.dayPortion
  );

  // Get the current PayTypeId
  const payTypeId = useMemo(() => {
    const matchingDayConversion = props.vacancyDayConversions.find(
      x => x.name === dayConversionName
    );
    return matchingDayConversion
      ? AbsenceReasonTrackingTypeId.Daily
      : AbsenceReasonTrackingTypeId.Hourly;
  }, [dayConversionName, props.vacancyDayConversions]);

  const daysInfo = useMemo(() => {
    const dayEquivalent = props.vacancyDayConversions.find(
      x => x.name === dayConversionName
    )?.dayEquivalent;
    if (dayEquivalent) {
      return dayEquivalent;
    }

    return vacancyDetail.dayPortion === vacancyDetail.totalDayPortion
      ? `${vacancyDetail.dayPortion.toFixed(1)}`
      : `${vacancyDetail.dayPortion.toFixed(
          1
        )}/${vacancyDetail.totalDayPortion.toFixed(1)}`;
  }, [
    dayConversionName,
    props.vacancyDayConversions,
    vacancyDetail.dayPortion,
    vacancyDetail.totalDayPortion,
  ]);

  const payInfo =
    payTypeId === AbsenceReasonTrackingTypeId.Daily
      ? `${daysInfo} ${t("Days")}`
      : `${minutesToHours(
          vacancyDetail.payDurationOverride ??
            vacancyDetail.actualDuration ??
            undefined
        )} ${t("Hours")}`;

  return (
    <Grid container>
      <Grid item xs={3}>
        <div
          className={classes.subNameText}
        >{`${vacancyDetail.assignment?.employee?.firstName} ${vacancyDetail.assignment?.employee?.lastName}`}</div>
        <div className={classes.lightText}>{`${t("in for")} ${
          vacancyDetail.vacancy?.absence?.employee?.firstName
        } ${vacancyDetail.vacancy?.absence?.employee?.lastName}`}</div>
        <div
          className={classes.lightText}
        >{`${vacancyDetail.vacancy?.position?.name}`}</div>
      </Grid>
      <Grid item xs={3}>
        <div className={classes.timeText}>{`${format(
          vacancyDetailStartTime,
          "h:mm aaa"
        )} - ${format(vacancyDetailEndTime, "h:mm aaa")}`}</div>
        <div className={classes.lightText}>{`${payInfo}`}</div>
      </Grid>
      <Grid item xs={3}>
        <div
          className={classes.assignmentIdText}
        >{`#C${vacancyDetail.assignment?.id}`}</div>
        <div className={classes.lightText}>{`${t("Absence")} #${
          vacancyDetail.vacancy?.absence?.id
        }`}</div>
      </Grid>
      <Grid item xs={3}>
        <div>{"Sign in "}</div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  lightText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
  },
  subNameText: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: "bold",
  },
  timeText: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: "normal",
  },
  assignmentIdText: {
    fontSize: theme.typography.pxToRem(14),
  },
}));
