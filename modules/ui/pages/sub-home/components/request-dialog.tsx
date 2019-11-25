import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  LinearProgress,
  Button,
} from "@material-ui/core";
import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { useQueryBundle } from "graphql/hooks";
import { WasEmployeeAssignedToJob } from "../graphql/was-employee-assigned.gen";
import { VacancyWasAssignedResult } from "graphql/server-types.gen";
import { CheckCircle } from "@material-ui/icons";

type Props = {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
  vacancyId: string | null;
};

export const RequestAbsenceDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [seconds, setSeconds] = useState(0);

  const wasEmployeeAssignedToJob = useQueryBundle(WasEmployeeAssignedToJob, {
    variables: {
      id: props.employeeId,
      vacancyId: props.vacancyId,
    },
    skip: !props.open,
  });

  useEffect(() => {
    let interval: any = null;

    if (props.open) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [props.open, seconds]);

  const waitingTitle =
    seconds < 4
      ? t("Processing your request")
      : seconds < 8
      ? t("Double-checking a few things")
      : t("Thanks for waiting");
  const waitingSubTitle =
    seconds < 4
      ? t("this will take a moment")
      : seconds < 8
      ? t("you can never be too sure")
      : t("almost done...");

  const wasEmployeeAssigned = (wasEmployeeAssignedToJob.state === "LOADING" ||
  wasEmployeeAssignedToJob.state === "UPDATING"
    ? {}
    : wasEmployeeAssignedToJob.data?.vacancy?.wasEmployeeAssignedToJob ??
      {}) as Pick<
    VacancyWasAssignedResult,
    | "assignmentId"
    | "description"
    | "employeeId"
    | "employeeWasAssigned"
    | "returnCode"
    | "vacancyId"
  >;

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      {(wasEmployeeAssignedToJob.state === "LOADING" ||
        wasEmployeeAssignedToJob.state === "UPDATING") && (
        <>
          <DialogTitle>{waitingTitle}</DialogTitle>
          <DialogTitle>{waitingSubTitle}</DialogTitle>
          <LinearProgress />
        </>
      )}
      {wasEmployeeAssigned &&
        wasEmployeeAssigned.employeeWasAssigned &&
        wasEmployeeAssigned.returnCode === 0 && (
          <>
            <DialogTitle>{t("It's all yours!")}</DialogTitle>
            <DialogTitle>{`${t("Confirmation")} #C${
              wasEmployeeAssigned.assignmentId
            }`}</DialogTitle>
            <CheckCircle />
          </>
        )}
      {(wasEmployeeAssigned &&
        !wasEmployeeAssigned.employeeWasAssigned &&
        wasEmployeeAssigned.returnCode === -1) ||
        (wasEmployeeAssigned.returnCode === -2 && (
          <>
            <DialogTitle>
              {t("We're sorry, this assignment is no longer available")}
            </DialogTitle>
            <Button variant="outlined" onClick={props.onClose}>
              {t("Return to search")}
            </Button>
          </>
        ))}
      <DialogActions>
        <TextButton onClick={props.onClose}>{t("Close")}</TextButton>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },

  lightText: {
    fontSize: theme.typography.fontSize,
  },
  locationText: {
    fontSize: theme.typography.fontSize + 4,
  },
  boldText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
}));
