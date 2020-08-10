import * as React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeAbsenceDetail } from "../types";
import { Grid, makeStyles, Chip, Link as MuiLink } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { isAfter } from "date-fns";
import { DayIcon } from "ui/components/day-icon";
import { Link } from "react-router-dom";
import {
  EmployeeEditAbsenceRoute,
  AdminEditAbsenceRoute,
} from "ui/routes/absence";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, ApprovalStatus } from "graphql/server-types.gen";
import { getBasicDateRangeDisplayText } from "ui/components/date-helpers";
import { useState } from "react";
import clsx from "clsx";
import { getDateRangeDisplay, getDayPartCountLabels } from "../helpers";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence: () => void;
  hideAbsence?: (absenceId: string) => Promise<void>;
  showAbsenceChip?: boolean;
  actingAsEmployee?: boolean;
  orgId?: string;
};

export const AbsenceDetailRowUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(false);

  const canCancel = props.actingAsEmployee
    ? isAfter(props.absence.startTimeLocal, new Date()) &&
      !props.absence.isFilled &&
      props.absence.approvalStatus !== ApprovalStatus.PartiallyApproved &&
      props.absence.approvalStatus !== ApprovalStatus.Approved &&
      props.absence.assignments.every(a => !a.verifiedAtUtc)
    : true;

  return (
    <>
      <Grid item xs={3}>
        <div className={classes.detailText}>{props.absence.absenceReason}</div>
        <div className={classes.subText}>
          {getDateRangeDisplay(props.absence.startDate, props.absence.endDate)}
        </div>
        {props.showAbsenceChip && <Chip label={t("Absence")} />}
      </Grid>
      <Grid item xs={3}>
        {props.absence.isFilled &&
          props.absence.assignments.map((a, i) => {
            return (
              <div
                key={i}
                className={clsx({
                  [classes.hide]: i > 0 && !assignmentsExpanded,
                  [classes.multiSubAssignmentDetail]:
                    props.absence.multipleSubsAssigned,
                })}
              >
                <div>
                  <span className={classes.detailText}>{a.name}</span>
                  {(props.absence.isPartiallyFilled ||
                    props.absence.multipleSubsAssigned) && (
                    <>
                      {" "}
                      <span className={classes.subText}>
                        (
                        {getBasicDateRangeDisplayText(
                          a.allDates,
                          undefined,
                          "MMM",
                          false
                        )}
                        )
                      </span>
                    </>
                  )}
                </div>
                {a.phoneNumber && (
                  <Can do={[PermissionEnum.SubstituteViewPhone]}>
                    <div className={classes.subText}>{a.phoneNumber}</div>
                  </Can>
                )}
              </div>
            );
          })}
        {props.absence.isFilled && props.absence.assignments.length > 1 && (
          <MuiLink
            className={classes.action}
            onClick={() => setAssignmentsExpanded(!assignmentsExpanded)}
          >
            {assignmentsExpanded ? t("Hide") : t("View all")}
          </MuiLink>
        )}
        {!props.absence.isFilled && props.absence.subRequired && (
          <div className={classes.subText}>{t("No substitute assigned")}</div>
        )}
        {!props.absence.isFilled && !props.absence.subRequired && (
          <div className={classes.subText}>{t("No substitute required")}</div>
        )}
      </Grid>
      <Grid item xs={2}>
        <div className={classes.dayPartContainer}>
          <DayIcon
            dayPortion={props.absence.allDayParts[0].dayPortion}
            startTime={props.absence.startTimeLocal.toString()}
          />
          <div className={classes.dayPart}>
            {getDayPartCountLabels(props.absence.allDayParts, t).map(
              (dp, i) => {
                return (
                  <div key={i} className={classes.detailText}>
                    {dp}
                  </div>
                );
              }
            )}

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
          className={classes.linkText}
        >
          {`#${props.absence.id}`}
        </Link>
      </Grid>
      {props.absence.approvalStatus === ApprovalStatus.Denied ? (
        <Grid item xs={3} className={classes.cancelButtonContainer}>
          {props.actingAsEmployee && (
            <TextButton
              onClick={async () => {
                if (props.hideAbsence) {
                  await props.hideAbsence(props.absence.id);
                }
              }}
              className={classes.hideLink}
            >
              {t("Hide")}
            </TextButton>
          )}
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
            className={classes.linkText}
          >
            {t("Resubmit")}
          </Link>
          <Chip label={t("Denied")} className={classes.deniedApprovalChip} />
        </Grid>
      ) : (
        <Grid item xs={3} className={classes.cancelButtonContainer}>
          <Can do={[PermissionEnum.AbsVacDelete]}>
            {props.cancelAbsence && canCancel && (
              <TextButton
                onClick={props.cancelAbsence}
                className={classes.linkText}
              >
                {t("Cancel")}
              </TextButton>
            )}
          </Can>
          {(props.absence.approvalStatus === ApprovalStatus.ApprovalRequired ||
            props.absence.approvalStatus ===
              ApprovalStatus.PartiallyApproved) && (
            <Chip
              label={t("Pending")}
              className={classes.pendingApprovalChip}
            />
          )}
        </Grid>
      )}
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
  multiSubAssignmentDetail: {
    paddingBottom: theme.spacing(),
  },
  hide: {
    display: "none",
  },
  action: {
    cursor: "pointer",
  },
  pendingApprovalChip: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.palette.text.primary,
    wdith: "48px",
  },
  deniedApprovalChip: {
    backgroundColor: theme.customColors.darkRed,
    color: theme.customColors.white,
    marginLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.2),
    paddingLeft: theme.spacing(0.2),
  },
  linkText: {
    color: theme.customColors.black,
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(14),
  },
  hideLink: {
    color: "#FF5555",
    fontSize: theme.typography.pxToRem(14),
  },
}));
