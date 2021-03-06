import * as React from "react";
import { useState, useMemo } from "react";
import {
  makeStyles,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMutationBundle } from "graphql/hooks";
import { Comment } from "./graphql/comment.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useMyApprovalWorkflows } from "reference-data/my-approval-workflows";

type Props = {
  approvalStateId: string;
  onSave?: () => void;
  actingAsEmployee?: boolean;
  approvalWorkflowId: string;
};

export const LeaveComment: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const myApprovalWorkflows = useMyApprovalWorkflows();
  const { approvalWorkflowId, actingAsEmployee } = props;

  const [doComment] = useMutationBundle(Comment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [comment, setComment] = useState("");
  const [commentIsPublic, setCommentIsPublic] = useState(true);

  const handleComment = async () => {
    const result = await doComment({
      variables: {
        approvalComment: {
          approvalStateId: props.approvalStateId,
          comment: comment,
          commentIsPublic: commentIsPublic,
        },
      },
    });
    if (result.data) {
      setComment("");
      if (props.onSave) props.onSave();
    }
  };

  const allowComments = useMemo(() => {
    if (actingAsEmployee) return true;

    // If I'm a member of the current group that needs to approve, show the buttons
    if (myApprovalWorkflows.find(x => x.id === approvalWorkflowId)) return true;
    return false;
  }, [actingAsEmployee, myApprovalWorkflows, approvalWorkflowId]);

  return allowComments ? (
    <div className={classes.container}>
      <div className={classes.label}>{t("Comment")}</div>
      <TextField
        multiline={true}
        rows="3"
        value={comment}
        fullWidth={true}
        variant="outlined"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setComment(e.target.value);
        }}
        className={classes.commentBox}
      />
      <div className={classes.buttonContainer}>
        {!actingAsEmployee && (
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
        )}
        <div className={classes.button}>
          <Button variant="contained" onClick={handleComment}>
            {t("Send")}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    paddingRight: theme.spacing(1),
  },
  buttonContainer: {
    display: "flex",
    marginTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: "100%",
    position: "relative",
  },
  label: {
    fontWeight: "bold",
  },
  button: {
    top: 0,
    right: 0,
    position: "absolute",
  },
  commentBox: {
    background: theme.customColors.white,
  },
}));
