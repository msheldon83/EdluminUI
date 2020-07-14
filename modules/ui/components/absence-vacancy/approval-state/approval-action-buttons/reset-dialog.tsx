import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  makeStyles,
  Divider,
  DialogActions,
  DialogTitle,
  Typography,
  FormControlLabel,
  TextField,
  Checkbox,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMutationBundle } from "graphql/hooks";
import { ResetApproval } from "../graphql/reset-approval.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { TextButton } from "ui/components/text-button";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import clsx from "clsx";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  onReset?: () => void;
  currentApproverGroupName: string;
  previousSteps: {
    stepId: string;
    approverGroupHeader?: { name: string } | null;
  }[];
};

export const ResetDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const previousSteps = props.previousSteps;

  const [comment, setComment] = useState("");
  const [commentIsPublic, setCommentIsPublic] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState("");

  useEffect(() => {
    if (previousSteps.length > 0) {
      setSelectedStepId(previousSteps[previousSteps.length - 1].stepId);
    }
  }, [previousSteps]);

  const [reset] = useMutationBundle(ResetApproval, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleReset = async () => {
    const result = await reset({
      variables: {
        resetState: {
          approvalStateId: props.approvalStateId,
          resetToStepId: selectedStepId,
          comment: comment,
          commentIsPublic: commentIsPublic,
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
        <div className={classes.subTitle}>{`${t(
          "This approval is currently waiting for"
        )} ${props.currentApproverGroupName}`}</div>
        <div>{t("Pick a step to reset to:")}</div>
        <div className={classes.stepsContainer}>
          {props.previousSteps.map((s, i) => {
            if (s.approverGroupHeader?.name) {
              return (
                <div
                  key={i}
                  className={clsx({
                    [classes.stepBox]: true,
                    [classes.selectedStep]: s.stepId === selectedStepId,
                  })}
                  onClick={() => setSelectedStepId(s.stepId)}
                >
                  <span className={classes.groupNameText}>
                    {s.approverGroupHeader?.name}
                  </span>
                </div>
              );
            }
          })}
        </div>
        <div>{t("Comment")}</div>
        <TextField
          multiline={true}
          rows="3"
          value={comment}
          fullWidth={true}
          variant="outlined"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setComment(e.target.value);
          }}
        />
        <FormControlLabel
          checked={commentIsPublic}
          control={
            <Checkbox
              onChange={e => {
                setCommentIsPublic(e.target.checked);
              }}
              color="primary"
            />
          }
          label={t("Visible to employee")}
        />
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose}>{t("No, go back")}</TextButton>
        <ButtonDisableOnClick variant="outlined" onClick={handleReset}>
          {t("Reset")}
        </ButtonDisableOnClick>
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
    height: "80px",
    lineHeight: "80px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),

    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
      cursor: "pointer",
    },
  },
  selectedStep: {
    border: "3px solid #050039",
  },
  groupNameText: {
    verticalAlign: "middle",
    display: "inline-block",
    lineHeight: "normal",
  },
  subTitle: {
    fontWeight: 600,
  },
}));
