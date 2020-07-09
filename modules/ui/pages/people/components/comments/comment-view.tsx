import * as React from "react";
import { Grid, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TextButton } from "ui/components/text-button";
import EditIcon from "@material-ui/icons/Edit";
import clsx from "clsx";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import { Comment, CommentUpdateInput } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";
import { parseISO } from "date-fns/esm";

type Props = {
  comment: Comment;
  onEditComment: (editComment: CommentUpdateInput) => void;
  onDeleteComment: (id: string) => void;
};

export const CommentView: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { comment, onEditComment } = props;

  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [payload, setPayload] = useState<string>(comment.payload ?? "");

  const changedLocal =
    new Date(comment.changedLocal).toLocaleDateString() +
    " " +
    new Date(comment.changedLocal).toLocaleTimeString();
  console.log(comment);

  return (
    <Grid container item xs={12}>
      <Grid item xs={2} className={classes.width}>
        {/* <div>{comment.poster}</div> */}
        <div className={classes.subText}>{changedLocal}</div>
        {/* <div className={classes.subText}>{comment.location}</div> */}
      </Grid>
      {showEdit ? (
        <>
          <Grid item xs={9}>
            <TextField
              rows="2"
              value={payload}
              multiline={true}
              placeholder={t("Comments")}
              fullWidth={true}
              variant="outlined"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPayload(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={1}>
            <div
              className={classes.iconHover}
              onClick={() => {
                if (payload != "") {
                  const commentUpdateInput: CommentUpdateInput = {
                    id: comment.id,
                    payload: payload,
                  };
                  onEditComment(commentUpdateInput);
                  setShowEdit(!showEdit);
                }
              }}
            >
              <CheckIcon />
            </div>
            <div
              className={classes.iconHover}
              onClick={() => {
                setShowEdit(!showEdit);
                setPayload(comment.payload ?? "");
              }}
            >
              <ClearIcon className={classes.editIcon} />
            </div>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={9}>
            {comment.payload}
            {comment.hasBeenEdited && (
              <div className={classes.edited}>{t("edited")}</div>
            )}
          </Grid>
          <Grid item xs={1}>
            <div
              className={classes.iconHover}
              onClick={() => {
                setShowEdit(!showEdit);
              }}
            >
              <EditIcon className={classes.editIcon} />
            </div>
          </Grid>
        </>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  editIcon: {
    marginTop: theme.spacing(1),
    height: "20px",
  },
  iconHover: {
    "&:hover": { cursor: "pointer" },
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  width: {
    width: "100%",
  },
  edited: {
    color: theme.customColors.edluminSubText,
    fontStyle: "italic",
  },
}));
