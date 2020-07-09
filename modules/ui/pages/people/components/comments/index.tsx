import * as React from "react";
import { Grid, TextField } from "@material-ui/core";
import { CommentView } from "./comment-view";
import { NewComment } from "./new-comment";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { SectionHeader } from "ui/components/section-header";
import {
  Comment,
  CommentUpdateInput,
  CommentCreateInput,
  DiscussionSubjectType,
  Maybe,
} from "graphql/server-types.gen";

type Props = {
  orgId: string;
  discussionSubjectType: DiscussionSubjectType;
  discussionId: string;
  orgUserId: string;
  onEditComment: (editComment: CommentUpdateInput) => void;
  onAddComment: (addComment: CommentCreateInput) => void;
  onDeleteComment: (id: string) => void;
  comments?: any[];
};

export const Comments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    comments,
    onEditComment,
    onAddComment,
    orgId,
    onDeleteComment,
    discussionSubjectType,
    discussionId,
    orgUserId,
  } = props;

  const [newCommentVisible, setNewCommentVisible] = useState<boolean>(false);
  const [comment, setComment] = useState<string>();

  return (
    <Section>
      <SectionHeader title={t("Comments")} />
      <Grid container item spacing={2}>
        {newCommentVisible && (
          <NewComment
            setNewCommentVisible={setNewCommentVisible}
            onAddComment={onAddComment}
            orgUserId={orgUserId}
            discussionSubjectType={discussionSubjectType}
            discussionId={discussionId}
            orgId={orgId}
          />
        )}
        {!newCommentVisible &&
        (comments?.length === 0 || comments === undefined) ? (
          <Grid item xs={12}>
            {t("No Comments")}
          </Grid>
        ) : (
          comments?.map((c, i) => (
            <CommentView
              comment={c}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              key={i}
            />
          ))
        )}
        <Grid item xs={12}>
          {comments && comments?.length > 3 && (
            <TextButton
              className={clsx({
                [classes.inline]: true,
                [classes.floatLeft]: true,
              })}
              onClick={() => {
                //Show All comments
              }}
            >
              <span className={classes.link}>
                {t(`View all ${comment?.length} comments`)}
              </span>
            </TextButton>
          )}
          {!newCommentVisible && (
            <TextButton
              className={classes.inline}
              onClick={() => {
                setNewCommentVisible(true);
              }}
            >
              <span className={classes.link}>{t("Add comment")}</span>
            </TextButton>
          )}
        </Grid>
      </Grid>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  link: {
    textDecoration: "underline",
    color: theme.customColors.primary,
  },
  floatLeft: {
    float: "left",
  },
  inline: {
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    display: "inline-block",
  },
}));
