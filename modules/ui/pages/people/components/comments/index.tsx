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
  CommentUpdateInput,
  CommentCreateInput,
  DiscussionSubjectType,
} from "graphql/server-types.gen";

type Props = {
  orgId: string;
  discussionSubjectType: DiscussionSubjectType;
  discussionId: string;
  orgUserId: string;
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
    discussionId,
    orgUserId,
    staffingOrgId,
  } = props;

  const [newCommentVisible, setNewCommentVisible] = useState<boolean>(false);

  const [truncatedComments, setTruncatedComments] = useState<boolean>(true);

  return (
    <Section className={classes.positionRelative}>
      <SectionHeader title={t("Comments")} />
      <Grid
        container
        item
        spacing={2}
        className={clsx({
          [classes.gridHeight]:
            truncatedComments && comments?.length > 0 && comments !== undefined,
        })}
      >
        {newCommentVisible && (
          <NewComment
            setNewCommentVisible={setNewCommentVisible}
            onAddComment={onAddComment}
            orgUserId={orgUserId}
            discussionSubjectType={discussionSubjectType}
            discussionId={discussionId}
            orgId={orgId}
            staffingOrgId={staffingOrgId}
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
              newCommentVisible={newCommentVisible}
              iterationCount={i}
              key={i}
            />
          ))
        )}
      </Grid>
      {truncatedComments && <div className={classes.fade}></div>}
      <Grid item xs={12} className={classes.paddingTop}>
        {comments && comments?.length > 3 && (
          <>
            {truncatedComments && (
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
                  {t(`View all ${comments?.length} comments`)}
                </span>
              </TextButton>
            )}
            {!truncatedComments && (
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
            className={classes.inline}
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
  floatLeft: {
    float: "left",
  },
  positionRelative: {
    position: "relative",
  },
  gridHeight: {
    height: "250px",
    overflow: "hidden",
    position: "relative",
  },
  paddingTop: {
    paddingTop: theme.spacing(1),
  },
  fade: {
    position: "absolute",
    height: "130px",
    left: "0",
    width: "100%",
    textAlign: "center",
    zIndex: 20,
    top: "200px",
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
