import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Grid,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  getHours,
  getMinutes,
  getMonth,
  getYear,
  isBefore,
  lastDayOfYear,
  parseISO,
  set,
} from "date-fns";
import { compact } from "lodash-es";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { OrgUserRole } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";
import { OrgUser } from "graphql/server-types.gen";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { ShowErrors } from "ui/components/error-helpers";
import { convertStringToDate, getDateRangeDisplayText } from "helpers/date";
import { getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates } from "ui/components/date-helpers";
import { GetEmployeeAbsences } from "../../graphql/get-employee-absences.gen";
import { getBeginningAndEndOfSchoolYear } from "ui/components/helpers";
import { GetSubstituteAssignments } from "../../graphql/get-substitute-assignments.gen";
import { DeleteDialogRow } from "./row";
import { AbsVac } from "./types";

type Props = {
  type: "delete" | OrgUserRole | null;
  now: Date;
  onAccept: () => void;
  onCancel: () => void;
  orgId: string;
  orgUser: Pick<
    OrgUser,
    "id" | "userId" | "isEmployee" | "isReplacementEmployee"
  >;
};

export const DeleteDialog: React.FC<Props> = ({
  type,
  now,
  onAccept,
  onCancel,
  orgId,
  orgUser,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const currentSchoolYear = useCurrentSchoolYear(orgId);

  let titleString;
  let showEmployee = orgUser.isEmployee;
  let showSubstitute = orgUser.isReplacementEmployee;
  switch (type) {
    case "delete":
      titleString = t("Are you sure you want to delete this user?");
      break;
    case OrgUserRole.Administrator:
      titleString = t(
        "Are you sure you want to remove the Administrator role from this user?"
      );
      showEmployee = false;
      showSubstitute = false;
      break;
    case OrgUserRole.Employee:
      titleString = t(
        "Are you sure you want to remove the Employee role from this user?"
      );
      showEmployee = true;
      showSubstitute = false;
      break;
    case OrgUserRole.ReplacementEmployee:
      titleString = titleString ?? "Substitute";
      titleString = t(
        "Are you sure you want to remove the Substitute role from this user?"
      );
      showEmployee = false;
      showSubstitute = true;
      break;
    default:
      titleString = "";
  }

  const toDate = currentSchoolYear
    ? parseISO(currentSchoolYear?.endDate)
    : getBeginningAndEndOfSchoolYear(now)[1];
  const getEmployeeAbsences = useQueryBundle(GetEmployeeAbsences, {
    fetchPolicy: "cache-first",
    variables: {
      id: orgUser.id,
      fromDate: now,
      toDate,
    },
  });
  let absenceSchedule: AbsVac[] = [];
  if (getEmployeeAbsences.state != "LOADING") {
    const dirtySchedule =
      getEmployeeAbsences.data?.employee?.employeeAbsenceSchedule;
    if (dirtySchedule) {
      absenceSchedule = compact(dirtySchedule)
        .filter(absence => {
          const startDateTime = set(parseISO(absence.startDate), {
            hours: getHours(parseISO(absence.startTimeLocal)),
            minutes: getMinutes(parseISO(absence.startTimeLocal)),
          });
          console.log(startDateTime);
          return isBefore(now, startDateTime);
        })
        .map(absence => {
          const detailDates = absence.details!.map(detail =>
            parseISO(detail!.startDate)
          );
          detailDates.sort();
          const dateRangeDisplay =
            getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates(
              detailDates
            ) ?? undefined;
          return {
            id: absence.id,
            dateRangeDisplay,
            type: "absence",
          };
        });
    }
    showEmployee =
      showEmployee && !!dirtySchedule && absenceSchedule.length > 0;
  }
  const getSubstituteAssignments = useQueryBundle(GetSubstituteAssignments, {
    fetchPolicy: "cache-first",
    variables: {
      id: orgUser.userId!,
      orgId,
      fromDate: now,
      toDate,
    },
    skip: !orgUser.userId,
  });
  let assignmentSchedule: AbsVac[] = [];
  if (getSubstituteAssignments.state != "LOADING") {
    const dirtySchedule =
      getSubstituteAssignments.data?.employee?.employeeAssignmentSchedule;
    if (dirtySchedule) {
      assignmentSchedule = compact(dirtySchedule).map(
        ({ vacancy, startDate, endDate }) => ({
          id: vacancy?.absence?.id ?? vacancy!.id,
          dateRangeDisplay:
            getDateRangeDisplayText(
              startDate ? convertStringToDate(startDate) : null,
              endDate ? convertStringToDate(endDate) : null
            ) ?? undefined,
          type: vacancy?.absence?.id ? "absence" : "vacancy",
        })
      );
    }
    showSubstitute =
      showSubstitute && !!dirtySchedule && assignmentSchedule.length > 0;
  }

  return (
    <Dialog open={type !== null} onClose={onCancel} scroll="paper">
      <DialogTitle disableTypography>
        <Typography variant="h5">{titleString}</Typography>
      </DialogTitle>
      <DialogContent>
        {(showEmployee || showSubstitute) && (
          <Grid container spacing={2}>
            {showEmployee && (
              <>
                <Grid item xs={12} className={classes.header}>
                  <Typography variant="h6">
                    {getEmployeeAbsences.state == "LOADING"
                      ? t("Loading absences...")
                      : t(
                          `The following absences for this employee will be deleted:`
                        )}
                  </Typography>
                </Grid>
                {getEmployeeAbsences.state != "LOADING" &&
                  absenceSchedule.map(absvac => (
                    <DeleteDialogRow key={absvac.id} {...absvac} />
                  ))}
              </>
            )}
            {showEmployee && showSubstitute && (
              <Grid item xs={12}>
                <Divider variant="fullWidth" />
              </Grid>
            )}
            {showSubstitute && (
              <>
                <Grid item xs={12} className={classes.header}>
                  <Typography variant="h6">
                    {getSubstituteAssignments.state == "LOADING"
                      ? t("Loading assignments...")
                      : t(
                          "The following assignments for this substitute will be deleted:"
                        )}
                  </Typography>
                </Grid>
                {getSubstituteAssignments.state != "LOADING" &&
                  assignmentSchedule.map(absvac => (
                    <DeleteDialogRow key={absvac.id} {...absvac} />
                  ))}
              </>
            )}
          </Grid>
        )}
      </DialogContent>
      <Divider variant="fullWidth" />
      <DialogActions>
        <TextButton onClick={onCancel} className={classes.buttonSpacing}>
          {t("No")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={onAccept}
          className={classes.delete}
        >
          {t("Yes")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  removeSub: {
    paddingTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
  },
  dividedContainer: { display: "flex" },
  delete: { color: theme.customColors.blue },
  header: { textAlign: "center" },
}));
