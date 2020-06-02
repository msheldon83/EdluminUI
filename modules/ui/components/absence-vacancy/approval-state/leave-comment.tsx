import * as React from "react";
import { useState } from "react";
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

type Props = {
  approvalStateId: string;
  onSave?: () => void;
  viewingAsEmployee?: boolean;
};

export const LeaveComment: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

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

  return (
    <>
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
      />
      <div className={classes.buttonContainer}>
        {!props.viewingAsEmployee && (
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
        <Button variant="contained" onClick={handleComment}>
          {t("Send")}
        </Button>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  buttonContainer: {
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    alignItems: "space-between",
  },
  label: {
    fontWeight: "bold",
  },
}));
