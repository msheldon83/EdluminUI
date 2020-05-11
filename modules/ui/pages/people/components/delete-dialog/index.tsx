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

function dropNulls<T>(
  withNulls: (T | null)[] | null | undefined
): T[] | undefined {
  return withNulls ? (withNulls.filter(o => o !== null) as T[]) : undefined;
}

type Props = {
  type: "delete" | OrgUserRole | null;
  now: Date;
  onAccept: () => void;
  onCancel: () => void;
  orgId: string;
  orgUser: Pick<OrgUser, "id" | "isEmployee" | "isReplacementEmployee">;
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
            {t("Delete")}
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
  const getEmployee = useQueryBundle(GetEmployeeById, {
    fetchPolicy: "cache-first",
    variables: { id: orgUser.id },
  });
  const getEmployeeAbsences = useQueryBundle(GetEmployeeAbsences, {
    fetchPolicy: "cache-first",
    variables: {
      id:
        getEmployee.state == "DONE"
          ? getEmployee.data.orgUser?.byId?.employee?.id ?? ""
          : "",
      fromDate: now,
      toDate,
    },
    skip: !(getEmployee.state == "DONE"),
  });
  const getSubstitute = useQueryBundle(GetSubstituteById, {
    fetchPolicy: "cache-first",
    variables: { id: orgUser.id },
  });
  const getSubstituteAssignments = useQueryBundle(GetSubstituteAssignments, {
    fetchPolicy: "cache-first",
    variables: {
      id:
        getSubstitute.state == "DONE"
          ? getSubstitute.data.orgUser?.byId?.userId ?? ""
          : "",
      orgId,
      fromDate: now,
      toDate,
    },
    skip: !(getSubstitute.state == "DONE"),
  });

  function printId<T>(t: T): T {
    console.log(t);
    return t;
  }

  return (
    <Dialog open={type !== null} onClose={onCancel} scroll="paper">
      <DialogTitle disableTypography>
        <Typography variant="h5">{titleString}</Typography>
      </DialogTitle>
      <DialogContent>
        {showEmployee && showSubstitute && (
          <div className={classes.dividedContainer}>
            {getEmployeeAbsences.state == "LOADING" ? (
              <Typography className={classes.dividedContent}>
                Loading absences...
              </Typography>
            ) : (
              <DeleteDialogList
                className={classes.dividedContent}
                name="absences"
                absvacs={dropNulls(
                  getEmployeeAbsences.data?.employee?.employeeAbsenceSchedule
                )?.map(absence => ({
                  ...absence,
                  type: "absence",
                }))}
              />
            )}
            <div className={classes.divider} />
            {getSubstituteAssignments.state == "LOADING" ? (
              <Typography className={classes.dividedContent}>
                Loading assignments...
              </Typography>
            ) : (
              <DeleteDialogList
                className={classes.dividedContent}
                name="assignments"
                absvacs={dropNulls(
                  printId(
                    getSubstituteAssignments.data?.employee
                      ?.employeeAssignmentSchedule
                  )
                )?.map(({ vacancy, ...absvac }) => ({
                  ...absvac,
                  type: vacancy?.absence ? "absence" : "vacancy",
                }))}
              />
            )}
          </div>
        )}
        {!showEmployee &&
          showSubstitute &&
          (getSubstituteAssignments.state == "LOADING" ? (
            <Typography>Loading assignments...</Typography>
          ) : (
            <DeleteDialogList
              name="assignments"
              absvacs={dropNulls(
                getSubstituteAssignments.data?.employee
                  ?.employeeAssignmentSchedule
              )?.map(({ vacancy, ...absvac }) => ({
                ...absvac,
                type: vacancy?.absence ? "absence" : "vacancy",
              }))}
            />
          ))}
        {showEmployee &&
          !showSubstitute &&
          (getEmployeeAbsences.state == "LOADING" ? (
            <Typography>Loading absences...</Typography>
          ) : (
            <DeleteDialogList
              name="absences"
              absvacs={dropNulls(
                getEmployeeAbsences.data?.employee?.employeeAbsenceSchedule
              )?.map(absence => ({
                ...absence,
                type: "absence",
              }))}
            />
          ))}
        {!showEmployee && !showSubstitute && (
          <Typography>
            {t(
              "This user was not an employee or a substitute, so no assignments or absences will be cancelled on deletion."
            )}
          </Typography>
        )}
      </DialogContent>

      <Divider className={classes.divider} />
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
  divider: {
    height: "inherit",
    borderLeft: "1px solid " + theme.customColors.gray,
  },
  dividedContent: { flex: 1, padding: theme.spacing(1) },
  dividedContainer: { display: "flex" },
  delete: { color: theme.customColors.blue },
}));
