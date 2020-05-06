import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { lastDayOfYear, parseISO } from "date-fns";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { OrgUser } from "graphql/server-types.gen";
import { DeleteDialogList, LinkProps } from "./view-delete-dialog-list";
import { useQueryBundle } from "graphql/hooks";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { GetEmployeeAbsences } from "../graphql/get-employee-absences.gen";
import { GetSubstituteAssignments } from "../graphql/get-substitute-assignments.gen";

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

  /*makeListComponent(
        "employee",
        "absences",
        ({ id }) => ({
          id,
          type: "absence",
        }),
        getEmployeeAbsences.state == "LOADING"
          ? "LOADING"
          : getEmployeeAbsences.data?.employee?.employeeAbsenceSchedule
          )*/

  let employeeComponent;
  if (!orgUser.isEmployee) {
    employeeComponent = undefined;
  } else if (getEmployeeAbsences.state == "LOADING") {
    employeeComponent = <Typography>Loading absences...</Typography>;
  } else {
    const nonNulls = dropNulls(
      getEmployeeAbsences.data?.employee?.employeeAbsenceSchedule
    );
    const links: LinkProps[] | undefined = nonNulls?.map(({ id }) => ({
      id,
      type: "absence",
    }));
    employeeComponent =
      links && links.length > 0 ? (
        <DeleteDialogList
          links={links}
          prefix="employee"
          width={200 / (orgUser.isReplacementEmployee ? 2 : 1)}
          height={200}
          rowHeight={20}
        />
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
    const links: LinkProps[] | undefined = nonNulls?.map(({ id, vacancy }) => ({
      id,
      type: vacancy?.absence ? "absence" : "vacancy",
    }));
    substituteComponent =
      links && links.length > 0 ? (
        <DeleteDialogList
          links={links}
          prefix="substitute"
          width={200 / (orgUser.isEmployee ? 2 : 1)}
          height={200}
          rowHeight={20}
        />
      ) : (
        <Typography>This substitute has no upcoming assignments</Typography>
      );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {t("Person Deletion Confirmation")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {}
          {t("Are you sure you would like to discard any unsaved changes?")}
        </Typography>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={onClose} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={onCancel}
          className={classes.delete}
        >
          {t("Discard Changes")}
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
