import * as React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeAbsenceDetail } from "../types";
import { Grid, makeStyles, Button, Chip, Tooltip } from "@material-ui/core";
import { isEqual, format } from "date-fns";
import { DayIcon } from "ui/components/day-icon";
import { Link } from "react-router-dom";
import {
  EmployeeEditAbsenceRoute,
  AdminEditAbsenceRoute,
} from "ui/routes/edit-absence";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, DayPart } from "graphql/server-types.gen";
import { compact, uniq } from "lodash-es";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence: () => void;
  showAbsenceChip?: boolean;
  actingAsEmployee?: boolean;
  orgId?: string;
};

export const AbsenceDetailRowUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const dateRangeDisplay = isEqual(
    props.absence.startDate,
    props.absence.endDate
  )
    ? format(props.absence.startDate, "MMM d")
    : `${format(props.absence.startDate, "MMM d")} - ${format(
        props.absence.endDate,
        "MMM d"
      )}`;

  const determineDayPartLabel = (dayPart: DayPart, count: number) => {
    switch (dayPart) {
      case DayPart.FullDay:
        return count > 1 ? t("Full Days") : t("Full Day");
      case DayPart.HalfDayAfternoon:
      case DayPart.HalfDayMorning:
        return count > 1 ? t("Half Days") : t("Half Day");
      case DayPart.Hourly:
        return count > 1 ? t("Hours") : t("Hour");
      case DayPart.QuarterDayEarlyAfternoon:
      case DayPart.QuarterDayLateAfternoon:
      case DayPart.QuarterDayEarlyMorning:
      case DayPart.QuarterDayLateMorning:
        return count > 1 ? t("Quarter Days") : t("Quarter Day");
      default:
        break;
    }
  };

  const uniqueDayParts = uniq(
    compact(props.absence.allDayParts.map(d => d.dayPart))
  );
  const dayPartCountLabels = uniqueDayParts.map(u => {
    const count = props.absence.allDayParts.filter(x => x.dayPart === u).length;
    return `${count} ${determineDayPartLabel(u, count)}`;
  });

  const employeeCancelWhileSubAssigned =
    props.actingAsEmployee && !!props.absence.substitute;

  const cancelButton = (
    <Button
      variant="outlined"
      onClick={employeeCancelWhileSubAssigned ? undefined : props.cancelAbsence}
      className={[
        classes.cancelButton,
        employeeCancelWhileSubAssigned ? classes.disabledButton : "",
      ].join(" ")}
      disableTouchRipple={employeeCancelWhileSubAssigned}
    >
      {t("Cancel")}
    </Button>
  );

  return (
    <>
      <Grid item xs={3}>
        <div className={classes.detailText}>{props.absence.absenceReason}</div>
        <div className={classes.subText}>{dateRangeDisplay}</div>
        {props.showAbsenceChip && <Chip label={t("Absence")} />}
      </Grid>
      <Grid item xs={3}>
        {props.absence.substitute && (
          <>
            <div className={classes.detailText}>
              {props.absence.substitute?.name}
            </div>
            <Can do={[PermissionEnum.SubstituteViewPhone]}>
              <div className={classes.subText}>
                {props.absence.substitute?.phoneNumber}
              </div>
            </Can>
          </>
        )}
        {!props.absence.substitute && props.absence.subRequired && (
          <div className={classes.subText}>{t("No substitute assigned")}</div>
        )}
        {!props.absence.substitute && !props.absence.subRequired && (
          <div className={classes.subText}>{t("No substitute required")}</div>
        )}
      </Grid>
      <Grid item xs={3}>
        <div className={classes.dayPartContainer}>
          <DayIcon
            dayPortion={props.absence.allDayParts[0].dayPortion}
            startTime={props.absence.startTimeLocal.toString()}
          />
          <div className={classes.dayPart}>
            {dayPartCountLabels.map((dp, i) => {
              return (
                <div key={`daypart-i`} className={classes.detailText}>
                  {dp}
                </div>
              );
            })}

            <div className={classes.subText}>
              {`${props.absence.startTime} - ${props.absence.endTime}`}
            </div>
          </div>
        </div>
      </Grid>
      <Grid item xs={1}>
        <Link
          to={
            props.actingAsEmployee
              ? EmployeeEditAbsenceRoute.generate({
                  absenceId: props.absence.id,
                })
              : AdminEditAbsenceRoute.generate({
                  absenceId: props.absence.id,
                  organizationId: props.orgId!,
                })
          }
          className={classes.detailText}
        >
          {`#${props.absence.id}`}
        </Link>
      </Grid>
      <Can do={[PermissionEnum.AbsVacDelete]}>
        {props.cancelAbsence && (
          <Grid item xs={2} className={classes.cancelButtonContainer}>
            {employeeCancelWhileSubAssigned ? (
              <Tooltip
                title={t(
                  "Absences with assigned substitutes may not be cancelled"
                )}
                placement={"top"}
              >
                {cancelButton}
              </Tooltip>
            ) : (
              cancelButton
            )}
          </Grid>
        )}
      </Can>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  detailText: {
    fontWeight: "bold",
    color: theme.customColors.black,
  },
  subText: {
    color: theme.customColors.edluminSubText,
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
  disabledButton: {
    opacity: 0.7,
  },
}));
