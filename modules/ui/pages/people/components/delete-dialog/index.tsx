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
import { lastDayOfYear, parseISO } from "date-fns";
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
import { GetEmployeeAbsences } from "../../graphql/get-employee-absences.gen";
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
  let buttons;
  let showEmployee = orgUser.isEmployee;
  let showSubstitute = orgUser.isReplacementEmployee;
  switch (type) {
    case "delete":
      titleString = t("Are you sure you want to delete this user?");
      buttons = (
        <>
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
        </>
      );
      break;
    case null:
      titleString = "";
      buttons = <></>;
      break;
    default:
      titleString = t(
        `Are you sure you want to remove the ${type[0] +
          type.substring(1).toLowerCase()} role from this user?`
      );
      showEmployee = type == OrgUserRole.Employee;
      showSubstitute = type == OrgUserRole.ReplacementEmployee;
      buttons = (
        <>
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
        </>
      );
  }

  const toDate = currentSchoolYear
    ? parseISO(currentSchoolYear?.endDate)
    : lastDayOfYear(now);
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
      absenceSchedule = compact(dirtySchedule).map(absence => ({
        ...absence,
        type: "absence",
      }));
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
        ({ isPartOfNormalVacancy, ...absVac }) => ({
          ...absVac,
          type: isPartOfNormalVacancy ? "vacancy" : "absence",
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
        {showEmployee &&
          (getEmployeeAbsences.state == "LOADING" ? (
            <Typography variant="h6" className={classes.dividedContent}>
              Loading absences...
            </Typography>
          ) : (
            <Grid container className={classes.dividedContent}>
              <Grid item xs={12}>
                <Typography variant="h6" className={classes.header}>
                  Absences to delete:
                </Typography>
                {absenceSchedule.map(absvac => (
                  <Grid item container key={absvac.id}>
                    <DeleteDialogRow {...absvac} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
        {showSubstitute &&
          (getSubstituteAssignments.state == "LOADING" ? (
            <Typography variant="h6" className={classes.dividedContent}>
              Loading assignments...
            </Typography>
          ) : (
            <Grid container className={classes.dividedContent}>
              <Typography variant="h6" className={classes.header}>
                Assignments to delete:
              </Typography>
              {assignmentSchedule.map(absvac => (
                <Grid item container key={absvac.id}>
                  <DeleteDialogRow {...absvac} />
                </Grid>
              ))}
            </Grid>
          ))}
      </DialogContent>

      <DialogActions>{buttons}</DialogActions>
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
  dividedContent: { flex: 1, padding: theme.spacing(1) },
  dividedContainer: { display: "flex" },
  delete: { color: theme.customColors.blue },
  header: { textAlign: "center" },
}));
