import * as React from "react";
import { Grid, TextField, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import clsx from "clsx";
import { OrgUserOrgRelationshipSelect } from "ui/components/reference-selects/org-user-org-relationship-select";
import {
  CommentCreateInput,
  DiscussionSubjectType,
  ObjectType,
} from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";

type Props = {
  setNewCommentVisible: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  objectType: ObjectType;
  discussionSubjectType: DiscussionSubjectType;
  orgId: string;
  staffingOrgId?: string | null;
  onAddComment: (addComment: CommentCreateInput) => Promise<boolean>;
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
    discussionSubjectType,
    userId,
    staffingOrgId,
    objectType,
  } = props;

  return (
    <Grid container item xs={12}>
      <Grid item xs={3} className={classes.width}>
        {staffingOrgId && (
          <OrgUserOrgRelationshipSelect
            staffingOrgId={staffingOrgId ?? ""}
            userId={userId}
            selectedOrgId={selectedOrgId}
            setSelectedOrgId={setSelectedOrgId}
            includeAllOption={true}
            includeMyOrgOption={true}
            label={t("Comment visible to: ")}
          />
        )}
      </Grid>
      <Grid
        item
        xs={8}
        className={clsx({
          [classes.marginTop]: staffingOrgId,
        })}
      >
        <TextField
          rows="2"
          value={payload}
          multiline={true}
          placeholder={t("Comment")}
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
              onClick={async () => {
                if (payload != "") {
                  let orgId;
                  if (
                    selectedOrgId === undefined &&
                    staffingOrgId !== undefined
                  )
                    orgId = staffingOrgId;
                  else if (selectedOrgId === undefined) return;
                  else orgId = selectedOrgId;

                  const addComment: CommentCreateInput = {
                    discussionSubjectType: discussionSubjectType,
                    objectKey: userId,
                    objectType: objectType,
                    orgId: orgId ?? "",
                    payload: payload,
                    hasShadow: selectedOrgId === undefined ? true : false,
                  };

                  const result = await onAddComment(addComment);
                  if (result) {
                    setPayload("");
                    setNewCommentVisible(false);
                  }
                }
              }}
              variant="contained"
            >
              {t("Submit")}
            </Button>
          </Grid>
          <Grid item className={classes.buttonPadding}>
            <Button
              onClick={() => {
                setNewCommentVisible(false);
              }}
              variant="outlined"
            >
              {t("Cancel")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={1} />
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
  marginTop: {
    marginTop: "23px",
  },
  paddingRight: {
    paddingRight: theme.spacing(1),
  },
  buttonPadding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));
