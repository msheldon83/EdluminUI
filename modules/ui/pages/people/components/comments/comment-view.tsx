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
import DeleteIcon from "@material-ui/icons/Delete";

type Props = {
  comment: Comment;
  onEditComment: (editComment: CommentUpdateInput) => void;
  onDeleteComment: (id: string) => void;
  setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
  showEdit: boolean;
  newCommentVisible: boolean;
};

export const CommentView: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    comment,
    onEditComment,
    newCommentVisible,
    onDeleteComment,
    setShowEdit,
    showEdit,
  } = props;

  const [payload, setPayload] = useState<string>(comment.payload ?? "");

  const createdLocal = formatAMPM(
    new Date(comment.createdLocal).toLocaleDateString(),
    new Date(comment.createdLocal)
  );

  const name = () => {
    let name;
    if (comment.actualUser === undefined) {
      name = "SysAdmin";
    } else if (comment.actingUser.id != comment.actualUser.id) {
      name = `${comment.actingUser.firstName} ${
        comment.actingUser.lastName
      } ${t("impersonated by")} ${comment.actualUser.firstName} ${
        comment.actualUser.lastName
      }}`;
    } else {
      name = `${comment.actingUser.firstName} ${comment.actingUser.lastName}`;
    }

    return name;
  };

  return (
    <Grid container item xs={12}>
      <Grid item xs={3} className={classes.width}>
        <div>{name()}</div>
        <div className={classes.subText}>{createdLocal}</div>
        {comment.actingOrgUser && (
          <div className={classes.subText}>
            {comment.actingOrgUser.organization.name}
          </div>
        )}
      </Grid>
      {showEdit ? (
        <>
          <Grid item xs={8}>
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
          <Grid item xs={1} className={classes.padding}>
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
              <ClearIcon className={classes.clearIcon} />
            </div>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={8}>
            {comment.payload}
            {comment.hasBeenEdited && (
              <div className={classes.edited}>{t("(edited)")}</div>
            )}
          </Grid>
          <Grid item xs={1}>
            {!newCommentVisible && (
              <>
                <div
                  className={classes.iconHover}
                  onClick={() => {
                    onDeleteComment(comment.id);
                  }}
                >
                  <DeleteIcon className={classes.deleteIcon} />
                </div>
                <div
                  className={classes.iconHover}
                  onClick={() => {
                    setShowEdit(!showEdit);
                  }}
                >
                  <EditIcon className={classes.editIcon} />
                </div>
              </>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  editIcon: {
    height: "20px",
  },
  deleteIcon: {
    height: "20px",
    float: "right",
  },
  clearIcon: {
    marginTop: theme.spacing(2),
  },
  iconHover: {
    "&:hover": { cursor: "pointer" },
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  padding: {
    paddingLeft: theme.spacing(1),
  },
  width: {
    width: "100%",
  },
  edited: {
    color: theme.customColors.edluminSubText,
    fontStyle: "italic",
  },
}));

const formatAMPM = (date: string, time: Date) => {
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const newMin = minutes < 10 ? "0" + minutes.toString() : minutes;
  const strTime = hours.toString() + ":" + newMin.toString() + " " + ampm;
  return date + " " + strTime;
};
