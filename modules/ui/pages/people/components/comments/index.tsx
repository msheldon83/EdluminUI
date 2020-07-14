import * as React from "react";
import { Grid } from "@material-ui/core";
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
  CommentUpdateInput,
  CommentCreateInput,
  DiscussionSubjectType,
} from "graphql/server-types.gen";

type Props = {
  orgId: string;
  discussionSubjectType: DiscussionSubjectType;
  userId: string;
  onEditComment: (editComment: CommentUpdateInput) => void;
  onAddComment: (addComment: CommentCreateInput) => Promise<boolean>;
  onDeleteComment: (id: string) => void;
  staffingOrgId?: string | null;
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
    userId,
    staffingOrgId,
  } = props;

  const [newCommentVisible, setNewCommentVisible] = useState<boolean>(false);
  const [truncatedComments, setTruncatedComments] = useState<boolean>(true);

  const commentLength = comments?.length ?? 0;

  return (
    <Section className={classes.positionRelative}>
      <SectionHeader title={t("Comments")} />
      <Grid
        container
        item
        spacing={2}
        className={clsx({
          [classes.gridHeight]: truncatedComments && commentLength > 0,
        })}
      >
        {newCommentVisible && (
          <NewComment
            setNewCommentVisible={setNewCommentVisible}
            onAddComment={onAddComment}
            userId={userId}
            discussionSubjectType={discussionSubjectType}
            orgId={orgId}
            staffingOrgId={staffingOrgId}
          />
        )}
        {!newCommentVisible && commentLength === 0 ? (
          <Grid item xs={12}>
            {t("No Comments")}
          </Grid>
        ) : (
          comments?.map((c, i) => (
            <CommentView
              comment={c}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              newCommentVisible={newCommentVisible}
              iterationCount={i}
              key={i}
            />
          ))
        )}
      </Grid>
      {truncatedComments && (
        <div
          className={clsx({
            [classes.fade]: commentLength > 3 && !newCommentVisible,
          })}
        ></div>
      )}
      <Grid item xs={12} className={classes.paddingTop}>
        {commentLength > 3 && (
          <>
            {truncatedComments && !newCommentVisible && (
              <TextButton
                className={clsx({
                  [classes.inline]: true,
                  [classes.floatLeft]: true,
                })}
                onClick={() => {
                  setTruncatedComments(false);
                }}
              >
                <span className={classes.link}>
                  {t(`View all ${commentLength} comments`)}
                </span>
              </TextButton>
            )}
            {!truncatedComments && !newCommentVisible && (
              <TextButton
                className={clsx({
                  [classes.inline]: true,
                  [classes.floatLeft]: true,
                })}
                onClick={() => {
                  setTruncatedComments(true);
                }}
              >
                <span className={classes.link}>{t("Hide Comments")}</span>
              </TextButton>
            )}
          </>
        )}
        {!newCommentVisible && (
          <TextButton
            className={clsx({
              [classes.inline]: true,
              [classes.paddingTop]: true,
            })}
            onClick={() => {
              setNewCommentVisible(true);
            }}
          >
            <span className={classes.link}>{t("Add comment")}</span>
          </TextButton>
        )}
      </Grid>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  link: {
    textDecoration: "underline",
    color: theme.customColors.primary,
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  floatLeft: {
    float: "left",
  },
  positionRelative: {
    position: "relative",
  },
  gridHeight: {
    maxHeight: "200px",
    overflow: "hidden",
    position: "relative",
  },
  fade: {
    position: "absolute",
    height: "110px",
    left: "0",
    width: "100%",
    textAlign: "center",
    zIndex: 20,
    top: "170px",
    background:
      "linear-gradient(rgba(255, 255, 255, 0)0%, rgba(255, 255, 255, 1) 100%)",
  },
  inline: {
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    display: "inline-block",
  },
}));
