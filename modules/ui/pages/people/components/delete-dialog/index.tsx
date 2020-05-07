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
import { makeStyles } from "@material-ui/styles";
import { OrgUser } from "graphql/server-types.gen";
import { useQueryBundle } from "graphql/hooks";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { GetEmployeeAbsences } from "../../graphql/get-employee-absences.gen";
import { GetSubstituteAssignments } from "../../graphql/get-substitute-assignments.gen";
import { DeleteDialogList } from "./list";
import { AbsVac } from "./types";

function dropNulls<T>(
  withNulls: (T | null)[] | null | undefined
): T[] | undefined {
  return withNulls ? (withNulls.filter(o => o !== null) as T[]) : undefined;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  orgId: string;
  orgUser: Pick<OrgUser, "id" | "isEmployee" | "isReplacementEmployee">;
};

export const DiscardChangesDialog: React.FC<Props> = ({
  open,
  onClose,
  onCancel,
  orgId,
  orgUser,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const currentSchoolYear = useCurrentSchoolYear(orgId);

  const fromDate = new Date();
  const toDate = currentSchoolYear
    ? parseISO(currentSchoolYear?.endDate)
    : lastDayOfYear(fromDate);
  const getEmployeeAbsences = useQueryBundle(GetEmployeeAbsences, {
    variables: {
      id: orgUser.id,
      fromDate,
      toDate,
    },
  });
  const getSubstituteAssignments = useQueryBundle(GetSubstituteAssignments, {
    variables: {
      id: orgUser.id,
      orgId,
      fromDate,
      toDate,
    },
  });

  const componentHeight = 200;
  const componentWidth = 200;

  let employeeComponent;
  if (!orgUser.isEmployee) {
    employeeComponent = undefined;
  } else if (getEmployeeAbsences.state == "LOADING") {
    employeeComponent = <Typography>Loading absences...</Typography>;
  } else {
    const nonNulls = dropNulls(
      getEmployeeAbsences.data?.employee?.employeeAbsenceSchedule
    );
    const absences: AbsVac[] | undefined = nonNulls?.map(absence => ({
      ...absence,
      type: "absence",
    }));
    employeeComponent =
      absences && absences.length > 0 ? (
        <DeleteDialogList absvacs={absences} />
      ) : (
        <Typography>This employee has no upcoming absences</Typography>
      );
  }

  let substituteComponent;
  if (!orgUser.isReplacementEmployee) {
    substituteComponent = undefined;
  } else if (getSubstituteAssignments.state == "LOADING") {
    substituteComponent = <Typography>Loading assignments...</Typography>;
  } else {
    const nonNulls = dropNulls(
      getSubstituteAssignments.data?.employee?.employeeAssignmentSchedule
    );
    const absvacs: AbsVac[] | undefined = nonNulls?.map(
      ({ vacancy, ...absvac }) => ({
        ...absvac,
        type: vacancy?.absence ? "absence" : "vacancy",
      })
    );
    substituteComponent =
      absvacs && absvacs.length > 0 ? (
        <DeleteDialogList absvacs={absvacs} />
      ) : (
        <Typography>This substitute has no upcoming assignments</Typography>
      );
  }

  return (
    <Dialog open={open} onClose={onClose} scroll="paper">
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("User Deletion Confirmation")}</Typography>
      </DialogTitle>
      <DialogContent>
        {employeeComponent && substituteComponent && (
          <Grid container alignItems="center">
            {employeeComponent}
            <Divider orientation="vertical" />
            {substituteComponent}
          </Grid>
        )}
        {!employeeComponent && substituteComponent && substituteComponent}
        {employeeComponent && !substituteComponent && employeeComponent}
        {!employeeComponent && !substituteComponent && (
          <Typography>
            {t(
              "This user was not an employee or a substitute, so no assignments or absences will be cancelled on deletion."
            )}
          </Typography>
        )}
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={onClose} className={classes.buttonSpacing}>
          {t("Cancel")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={onCancel}
          className={classes.delete}
        >
          {t("Delte")}
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
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  delete: { color: theme.customColors.blue },
}));
