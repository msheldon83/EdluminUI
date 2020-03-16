import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  LinearProgress,
  Button,
  IconButton,
  Typography,
  Grid,
  Box,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { useQueryBundle } from "graphql/hooks";
import { WasEmployeeAssignedToJob } from "../graphql/was-employee-assigned.gen";
import { VacancyWasAssignedResult } from "graphql/server-types.gen";
import { CheckCircle, Close } from "@material-ui/icons";
import { useIsMobile } from "hooks";

type Props = {
  open: boolean;
  onClose: (assignmentId?: string | null) => void;
  employeeId: string | null;
  vacancyId: string | null;
};

export const RequestAbsenceDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

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
    seconds < 8 ? t("this will take a moment") : t("almost done...");

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
    <Dialog
      open={props.open}
      onClose={() => props.onClose(wasEmployeeAssigned.assignmentId)}
    >
      <DialogContent className={classes.dialog}>
        {wasEmployeeAssigned.returnCode === 0 ? (
          <div
            className={isMobile ? classes.mobileContainer : classes.container}
          >
            <Typography className={classes.subTitle}>
              {t("It's all yours!")}
            </Typography>
            <Typography variant="h5">{`${t("Confirmation")} #C${
              wasEmployeeAssigned.assignmentId
            }`}</Typography>
            <CheckCircle className={classes.checkIcon} />
          </div>
        ) : wasEmployeeAssigned.returnCode === -1 ? (
          <div
            className={isMobile ? classes.mobileContainer : classes.container}
          >
            <Typography variant="h5">
              {t("We're sorry, this assignment")}
            </Typography>
            <Typography variant="h5">{t("is no longer available")}</Typography>
          </div>
        ) : wasEmployeeAssigned.returnCode === -2 ||
          wasEmployeeAssigned.returnCode === -3 ||
          wasEmployeeAssigned.returnCode === -4 ? (
          <div
            className={isMobile ? classes.mobileContainer : classes.container}
          >
            <Typography variant="h5">
              {wasEmployeeAssigned.description}
            </Typography>
          </div>
        ) : (
          <div
            className={isMobile ? classes.mobileContainer : classes.container}
          >
            <Typography variant="h5">{waitingTitle}</Typography>
            <Typography className={classes.subTitle}>
              {waitingSubTitle}
            </Typography>
            <LinearProgress
              className={isMobile ? classes.mobileProgress : classes.progress}
            />
          </div>
        )}
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => props.onClose(wasEmployeeAssigned.assignmentId)}
        >
          {t("Return to search")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  mobileContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 200,
    width: 375,
  },
  dialog: {
    padding: theme.spacing(2),
  },
  typography: {
    padding: theme.spacing(2),
  },
  subTitle: {
    fontSize: theme.typography.fontSize,
  },
  checkIcon: {
    color: "#099E47",
    fontSize: "3em",
  },
  progress: {
    width: 300,
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  mobileProgress: {
    width: 225,
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
  },
}));
