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
} from "@material-ui/core";
import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { useQueryBundle } from "graphql/hooks";
import { WasEmployeeAssignedToJob } from "../graphql/was-employee-assigned.gen";
import { VacancyWasAssignedResult } from "graphql/server-types.gen";
import { CheckCircle, Close } from "@material-ui/icons";

type Props = {
  open: boolean;
  onClose: (assignmentId?: string | null) => void;
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
    <Dialog
      open={props.open}
      onClose={() => props.onClose(wasEmployeeAssigned.assignmentId)}
    >
      <Box height={300} width={510}>
        <div style={{ padding: 20 }}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid container item justify="flex-end">
              <IconButton
                onClick={() => props.onClose(wasEmployeeAssigned.assignmentId)}
              >
                <Close />
              </IconButton>
            </Grid>
            {wasEmployeeAssigned.returnCode === 0 ? (
              <>
                <Grid item>
                  <Typography className={classes.subTitle}>
                    {t("It's all yours!")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h5">{`${t("Confirmation")} #C${
                    wasEmployeeAssigned.assignmentId
                  }`}</Typography>
                </Grid>
                <Grid item>
                  <CheckCircle className={classes.checkIcon} />
                </Grid>
              </>
            ) : wasEmployeeAssigned.returnCode === -1 ? (
              <>
                <Grid item>
                  <Typography variant="h5">
                    {t("We're sorry, this assignment")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h5">
                    {t("is no longer available")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      props.onClose(wasEmployeeAssigned.assignmentId)
                    }
                  >
                    {t("Return to search")}
                  </Button>
                </Grid>
              </>
            ) : wasEmployeeAssigned.returnCode === -2 ||
              wasEmployeeAssigned.returnCode === -3 ||
              wasEmployeeAssigned.returnCode === -4 ? (
              <>
                <Grid item>
                  <Typography variant="h5">
                    {wasEmployeeAssigned.description}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      props.onClose(wasEmployeeAssigned.assignmentId)
                    }
                  >
                    {t("Return to search")}
                  </Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid item>
                  <Typography variant="h5">{waitingTitle}</Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.subTitle}>
                    {waitingSubTitle}
                  </Typography>
                </Grid>
                <Grid item>
                  <LinearProgress className={classes.progress} />
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </Box>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  dialog: {
    maxWidth: 400,
    maxHeight: 230,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
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
}));
