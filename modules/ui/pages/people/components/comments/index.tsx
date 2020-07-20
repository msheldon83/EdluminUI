import * as React from "react";
import { Grid } from "@material-ui/core";
import { CommentView } from "./comment-view";
import { NewComment } from "./new-comment";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { CreateComment } from "../../graphql/create-comment.gen";
import { UpdateComment } from "../../graphql/update-comment.gen";
import { DeleteComment } from "../../graphql/delete-comment.gen";
import { useState } from "react";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { SectionHeader } from "ui/components/section-header";
import {
  CommentUpdateInput,
  CommentCreateInput,
  DiscussionSubjectType,
  ObjectType,
} from "graphql/server-types.gen";

type Props = {
  orgId: string;
  objectType: ObjectType;
  discussionSubjectType: DiscussionSubjectType;
  userId: string;
  staffingOrgId?: string | null;
  comments?: any[];
  refetchQuery: () => void;
};

export const Comments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const classes = useStyles();

  const {
    comments,
    orgId,
    discussionSubjectType,
    userId,
    staffingOrgId,
    objectType,
    refetchQuery,
  } = props;

  const [newCommentVisible, setNewCommentVisible] = useState<boolean>(false);
  const [truncatedComments, setTruncatedComments] = useState<boolean>(true);

  const commentLength = comments?.length ?? 0;

  const [updateComment] = useMutationBundle(UpdateComment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [addComment] = useMutationBundle(CreateComment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deleteComment] = useMutationBundle(DeleteComment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onAddComment = async (comment: CommentCreateInput) => {
    const result = await addComment({
      variables: {
        comment: comment,
      },
    });

    if (result.data != null || result.data != undefined) {
      refetchQuery();
      return true;
    }
    return false;
  };

  const onEditComment = async (comment: CommentUpdateInput) => {
    await updateComment({
      variables: {
        comment: comment,
      },
    });
    refetchQuery();
  };

  const onDeleteComment = async (id: string) => {
    await deleteComment({
      variables: {
        commentId: id,
      },
    });
    refetchQuery();
  };

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
            objectType={objectType}
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
    maxHeight: "220px",
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
    top: "190px",
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
