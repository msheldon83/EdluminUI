import * as React from "react";
import { useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApprovalAction } from "graphql/server-types.gen";
import { LeaveComment } from "./leave-comment";
import { parseISO, format } from "date-fns";

type CommentDecision = {
  comment?: string | null;
  approvalActionId?: ApprovalAction;
  commentIsPublic: boolean;
  createdLocal?: string | null;
  actingUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  actualUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

type Props = {
  orgId: string;
  actingAsEmployee?: boolean;
  approvalStateId: string;
  approvalWorkflowId: string;
  comments: {
    comment?: string | null;
    commentIsPublic: boolean;
    createdLocal?: string | null;
    actingUser: {
      id: string;
      firstName: string;
      lastName: string;
    };
    actualUser: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  decisions: {
    approvalActionId: ApprovalAction;
    createdLocal?: string | null;
    actingUser: {
      id: string;
      firstName: string;
      lastName: string;
    };
    actualUser: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  onCommentSave?: () => void;
};

export const ApprovalComments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { comments, decisions } = props;

  const [allCommentsShown, setAllCommentsShown] = useState(false);

  const allCommentsAndDecisions = useMemo(() => {
    const list: CommentDecision[] = [];
    comments.forEach(c => {
      list.push({
        comment: c.comment,
        actingUser: c.actingUser,
        actualUser: c.actualUser,
        commentIsPublic: c.commentIsPublic,
        createdLocal: c.createdLocal,
      });
    });
    decisions.forEach(d => {
      list.push({
        approvalActionId: d.approvalActionId,
        actingUser: d.actingUser,
        actualUser: d.actualUser,
        commentIsPublic: true,
        createdLocal: d.createdLocal,
      });
    });

    return list.sort((a, b) =>
      a.createdLocal && b.createdLocal && a.createdLocal > b.createdLocal
        ? 1
        : a.createdLocal && b.createdLocal && b.createdLocal > a.createdLocal
        ? -1
        : 0
    );
  }, [comments, decisions]);

  const getApprovalActionText = (approvalAction?: ApprovalAction) => {
    if (approvalAction == ApprovalAction.Approve) return t("Approved by ");
    if (approvalAction == ApprovalAction.Deny) return t("Denied by ");
    if (approvalAction == ApprovalAction.Skip) return t("Skipped by ");
    return null;
  };

  const getApproverName = (comment: CommentDecision) => {
    if (comment.actingUser.id === comment.actualUser.id) {
      return `${comment.actingUser.firstName} ${comment.actingUser.lastName}`;
    }
    return `${comment.actualUser.firstName} ${comment.actualUser.lastName} ${t(
      "on behalf of"
    )} ${comment.actingUser.firstName} ${comment.actingUser.lastName}`;
  };

  return (
    <>
      {allCommentsAndDecisions.length === 0 ? (
        <div className={classes.commentContainer}>{t("No Comments")}</div>
      ) : (
        allCommentsAndDecisions.map((c, i) => {
          return (
            <div key={i} className={classes.commentContainer}>
              {c.comment && (
                <div className={classes.commentIcon}>
                  {c.commentIsPublic ? (
                    <img src={require("ui/icons/comment.svg")} />
                  ) : (
                    <img
                      src={require("ui/icons/comment-visible-to-admin.svg")}
                    />
                  )}
                </div>
              )}
              <div>
                <div>
                  <span
                    className={
                      c.approvalActionId
                        ? classes.decisionText
                        : classes.nameText
                    }
                  >{`${getApprovalActionText(c.approvalActionId) ??
                    ""}${getApproverName(c)}`}</span>
                  <span
                    className={
                      c.approvalActionId
                        ? classes.decisionText
                        : classes.dateText
                    }
                  >{` @ ${format(
                    parseISO(c.createdLocal!),
                    "MMM d h:mm a"
                  )}`}</span>
                </div>
                {c.comment && <div>{c.comment}</div>}
              </div>
            </div>
          );
        })
      )}
      <LeaveComment
        approvalStateId={props.approvalStateId}
        actingAsEmployee={props.actingAsEmployee}
        onSave={props.onCommentSave}
        approvalWorkflowId={props.approvalWorkflowId}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  commentContainer: {
    display: "flex",
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  approveButton: {
    background: "#4CC17C",
  },
  denyButton: {
    background: "#FF5555",
    marginRight: theme.spacing(1),
  },
  buttonContainer: {
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    alignItems: "space-between",
  },
  nameText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "bold",
  },
  dateText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "normal",
    color: "#C4C4C4",
  },
  decisionText: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 600,
  },
  commentIcon: {
    paddingRight: theme.spacing(1),
  },
}));
