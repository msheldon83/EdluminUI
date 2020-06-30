import * as React from "react";
import {
  Dialog,
  DialogContent,
  makeStyles,
  Divider,
  DialogActions,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMutationBundle } from "graphql/hooks";
import { ResetApproval } from "../graphql/reset-approval.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { TextButton } from "ui/components/text-button";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  onReset?: () => void;
  currentApproverGroupName: string;
  previousSteps: {
    stepId: string;
    approverGroupHeaderName: string;
  }[];
};

export const ResetDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [reset] = useMutationBundle(ResetApproval, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleReset = async (stepId: string) => {
    const result = await reset({
      variables: {
        resetState: {
          approvalStateId: props.approvalStateId,
          resetToStepId: stepId,
        },
      },
    });
    if (result?.data) {
      if (props.onReset) {
        props.onReset();
      }
      props.onClose();
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={false}
      maxWidth={"lg"}
    >
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Reset")}</Typography>
      </DialogTitle>
      <DialogContent>
        <div>{`${t("This approval is currently waiting for")} ${
          props.currentApproverGroupName
        }`}</div>
        <div>{t("Pick a step to reset to:")}</div>
        <div className={classes.stepsContainer}>
          {props.previousSteps.map((s, i) => {
            if (s.approverGroupHeaderName) {
              return (
                <div
                  key={i}
                  className={classes.stepBox}
                  onClick={async () => await handleReset(s.stepId)}
                >
                  <span className={classes.groupNameText}>
                    {s.approverGroupHeaderName}
                  </span>
                </div>
              );
            }
          })}
        </div>
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose}>{t("No, go back")}</TextButton>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  stepsContainer: {
    display: "flex",
  },
  stepBox: {
    border: "1px solid #050039",
    background: "#FFFFFF",
    boxSizing: "border-box",
    width: "115px",
    height: "70px",
    lineHeight: "70px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
      cursor: "pointer",
    },
  },
  groupNameText: {
    verticalAlign: "middle",
    display: "inline-block",
    lineHeight: "normal",
  },
}));
