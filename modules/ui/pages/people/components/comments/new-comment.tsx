import * as React from "react";
import { Grid, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import {
  CommentCreateInput,
  DiscussionSubjectType,
  ObjectType,
} from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";

type Props = {
  setNewCommentVisible: React.Dispatch<React.SetStateAction<boolean>>;
  discussionId?: string;
  orgUserId: string;
  discussionSubjectType: DiscussionSubjectType;
  orgId: string;
  onAddComment: (addComment: CommentCreateInput) => void;
};

export const NewComment: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [payload, setPayload] = useState<string>("");
  const [orgId, setOrgId] = useState<string>(props.orgId);

  const {
    setNewCommentVisible,
    onAddComment,
    discussionId,
    discussionSubjectType,
    orgUserId,
  } = props;

  // If this is a staffing Org, then show drop down with org choices.
  // Otherwise pass the current OrgId & hasShadow == false

  return (
    <Grid container item xs={12}>
      <Grid item xs={2} className={classes.width}></Grid>
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
          className={classes.iconContainer}
          onClick={() => {
            if (payload != "") {
              const addComment: CommentCreateInput = {
                discussionSubjectType: discussionSubjectType,
                objectKey: orgUserId,
                objectType: ObjectType.OrgUser,
                orgId: orgId,
                payload: payload,
                discussionId: discussionId,
              };
              onAddComment(addComment);
            }
          }}
        >
          <CheckIcon />
        </div>
        <div
          className={classes.iconContainer}
          onClick={() => {
            setNewCommentVisible(false);
          }}
        >
          <ClearIcon className={classes.editIcon} />
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  iconContainer: {
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    "&:hover": {
      cursor: "pointer",
    },
  },
  width: {
    width: "100%",
  },
  displayInline: {
    display: "inline-block",
  },
  editIcon: {
    float: "left",
    marginTop: theme.spacing(1),
    height: "20px",
  },
  textHeight: {
    height: "30px",
  },
}));
