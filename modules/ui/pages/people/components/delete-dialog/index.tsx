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
import { GetEmployeeById } from "../../graphql/employee/get-employee-by-id.gen";
import { GetEmployeeAbsences } from "../../graphql/get-employee-absences.gen";
import { GetSubstituteById } from "../../graphql/substitute/get-substitute-by-id.gen";
import { GetSubstituteAssignments } from "../../graphql/get-substitute-assignments.gen";
import { DeleteDialogList } from "./list";
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
      titleString = t("Delete User Confirmation");
      buttons = (
        <>
          <TextButton onClick={onCancel} className={classes.buttonSpacing}>
            {t("Cancel")}
          </TextButton>
          <ButtonDisableOnClick
            variant="outlined"
            onClick={onAccept}
            className={classes.delete}
          >
            {t("Ok")}
          </ButtonDisableOnClick>
        </>
      );
      break;
    case null:
      titleString = "";
      buttons = <></>;
      break;
    default:
      titleString = t("Role deletion confirmation");
      showEmployee = type == OrgUserRole.Employee;
      showSubstitute = type == OrgUserRole.ReplacementEmployee;
      buttons = (
        <>
          <TextButton onClick={onCancel} className={classes.buttonSpacing}>
            {t("Cancel")}
          </TextButton>
          <ButtonDisableOnClick
            variant="outlined"
            onClick={onAccept}
            className={classes.delete}
          >
            {t("Remove role")}
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
        {(showEmployee || showSubstitute) && (
          <>
            {showEmployee &&
              (getEmployeeAbsences.state == "LOADING" ? (
                <Typography variant="h6" className={classes.dividedContent}>
                  Loading absences...
                </Typography>
              ) : (
                <DeleteDialogList
                  className={classes.dividedContent}
                  name="absences"
                  absvacs={absenceSchedule}
                />
              ))}
            {showSubstitute &&
              (getSubstituteAssignments.state == "LOADING" ? (
                <Typography variant="h6" className={classes.dividedContent}>
                  Loading assignments...
                </Typography>
              ) : (
                <DeleteDialogList
                  className={classes.dividedContent}
                  name="assignments"
                  absvacs={assignmentSchedule}
                />
              ))}
          </>
        )}
        {!showEmployee && !showSubstitute && (
          <Typography>
            {t("Are you sure you want to delete this administrator?")}
          </Typography>
        )}
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
}));
