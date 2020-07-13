import * as React from "react";
import { Grid, TextField, Button } from "@material-ui/core";
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
  newCommentVisible: boolean;
  iterationCount: number;
};

export const CommentView: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { comment, onEditComment, newCommentVisible, onDeleteComment } = props;

  const [showEdit, setShowEdit] = useState<boolean>(false);

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
    <Grid
      container
      item
      xs={12}
      className={clsx({ [classes.backgroundColor]: props.iterationCount % 2 })}
    >
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
            <Grid container item xs={12} justify="flex-end">
              <Grid
                item
                className={clsx({
                  [classes.buttonPadding]: true,
                  [classes.paddingRight]: true,
                })}
              >
                <Button
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
                  variant="contained"
                >
                  {t("Save")}
                </Button>
              </Grid>
              <Grid
                item
                className={clsx({
                  [classes.buttonPadding]: true,
                  [classes.paddingRight]: true,
                })}
              >
                <Button
                  onClick={() => {
                    setShowEdit(!showEdit);
                  }}
                  variant="outlined"
                >
                  {t("Cancel")}
                </Button>
              </Grid>
              <Grid item className={classes.buttonPadding}>
                <Button
                  onClick={() => {
                    onDeleteComment(comment.id);
                    setShowEdit(!showEdit);
                  }}
                  variant="outlined"
                >
                  {t("Delete")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1} />
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
              <div
                className={classes.iconHover}
                onClick={() => {
                  setShowEdit(!showEdit);
                }}
              >
                <EditIcon className={classes.icon} />
              </div>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  icon: {
    height: "20px",
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
  paddingRight: {
    paddingRight: theme.spacing(1),
  },
  buttonPadding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  width: {
    width: "100%",
  },
  backgroundColor: {
    backgroundColor: theme.customColors.lightGray,
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
