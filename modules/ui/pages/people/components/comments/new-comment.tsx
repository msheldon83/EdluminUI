import * as React from "react";
import { Grid, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import { OrgRelationshipSelect } from "ui/components/reference-selects/org-relationship-select";
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
  staffingOrgId?: string | null;
  onAddComment: (addComment: CommentCreateInput) => void;
};

export const NewComment: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [payload, setPayload] = useState<string>("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null | undefined>(
    props.orgId
  );

  const {
    setNewCommentVisible,
    onAddComment,
    discussionId,
    discussionSubjectType,
    orgUserId,
    orgId,
    staffingOrgId,
  } = props;

  return (
    <Grid container item xs={12}>
      <Grid item xs={3} className={classes.width}>
        {staffingOrgId && (
          <OrgRelationshipSelect
            orgId={orgId}
            selectedOrgId={selectedOrgId}
            setSelectedOrgId={setSelectedOrgId}
            includeAllOption={true}
            includeMyOrgOption={true}
            label={t("Something Here")}
          />
        )}
      </Grid>
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
      <Grid item xs={1}>
        <div
          className={classes.iconContainer}
          onClick={() => {
            if (payload != "" && selectedOrgId) {
              const addComment: CommentCreateInput = {
                discussionSubjectType: discussionSubjectType,
                objectKey: orgUserId,
                objectType: ObjectType.OrgUser,
                orgId:
                  selectedOrgId === undefined ? staffingOrgId! : selectedOrgId,
                payload: payload,
                hasShadow: selectedOrgId === undefined ? true : false,
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
    paddingRight: theme.spacing(1),
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
