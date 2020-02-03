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
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence?: () => void;
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

  const dayPortionLabel = React.useMemo(() => {
    const dayPortion = props.absence.totalDayPortion;
    if (dayPortion < 0.5) {
      return t("Partial day (hourly)");
    } else if (dayPortion === 0.5) {
      return t("Half day");
    } else if (dayPortion > 0.5 && dayPortion < 2) {
      return t("Full day");
    } else {
      return t("Full days");
    }
  }, [props.absence.totalDayPortion, t]);

  const dayPortionNumberDisplay = Math.round(props.absence.totalDayPortion);
  const dayPortionDisplay =
    dayPortionNumberDisplay >= 1
      ? `${dayPortionNumberDisplay} ${dayPortionLabel}`
      : dayPortionLabel;

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
            dayPortion={props.absence.totalDayPortion}
            startTime={props.absence.startTimeLocal.toString()}
          />
          <div className={classes.dayPart}>
            <div className={classes.detailText}>{dayPortionDisplay}</div>
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
