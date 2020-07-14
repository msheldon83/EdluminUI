import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, makeStyles, LinearProgress } from "@material-ui/core";
import { ApprovalStatus } from "graphql/server-types.gen";
import { VacancyApprovalViewRoute } from "ui/routes/vacancy";
import {
  AdminAbsenceApprovalViewRoute,
  EmployeeAbsenceApprovalViewRoute,
} from "ui/routes/edit-absence";
import { ApproveDenyDialog } from "./approve-dialog";
import { CommentDialog } from "./comment-dialog";
import { useMyApprovalWorkflows } from "reference-data/my-approval-workflows";
import { ApprovalWorkflowSteps } from "../types";
import clsx from "clsx";
import { Maybe } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  approvalState: {
    id: string;
    canApprove: boolean;
    approvalWorkflowId: string;
    approvalWorkflow: {
      steps: ApprovalWorkflowSteps[];
    };
    approvalStatusId: ApprovalStatus;
    deniedApproverGroupHeaderName?: string | null;
    approvedApproverGroupHeaderNames?: Maybe<string>[] | null;
    pendingApproverGroupHeaderName?: string | null;
    comments: {
      commentIsPublic: boolean;
    }[];
  };
  actingAsEmployee?: boolean;
  absenceId?: string;
  vacancyId?: string;
  isTrueVacancy: boolean;
  onChange?: () => void;
};

export const ApprovalState: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { approvalState, actingAsEmployee } = props;

  const myApprovalWorkflows = useMyApprovalWorkflows();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const onCloseDialog = () => {
    setApproveDialogOpen(false);
    setCommentDialogOpen(false);
  };

  const onOpenApproveDialog = () => {
    setApproveDialogOpen(true);
  };

  const onOpenCommentDialog = () => {
    setCommentDialogOpen(true);
  };

  const stepCount = approvalState.approvalWorkflow.steps.filter(
    x => !x.isFirstStep && !x.isLastStep && !x.deleted
  ).length;

  const barPercentage = useMemo(() => {
    if (approvalState.approvalStatusId === ApprovalStatus.Approved) return 100;
    const approvedCount = approvalState.approvedApproverGroupHeaderNames
      ? approvalState.approvedApproverGroupHeaderNames.length
      : 0;
    const deniedCount = approvalState.deniedApproverGroupHeaderName ? 1 : 0;
    return ((approvedCount + deniedCount) / stepCount) * 100;
  }, [approvalState.approvalStatusId, stepCount]);

  const allowComments = useMemo(() => {
    if (actingAsEmployee) return true;

    // If I'm a member of the current group that needs to approve, show the buttons
    if (
      myApprovalWorkflows.find(x => x.id === approvalState.approvalWorkflowId)
    )
      return true;
    return false;
  }, [actingAsEmployee, myApprovalWorkflows, approvalState.approvalWorkflowId]);

  if (
    approvalState.approvalStatusId !== ApprovalStatus.Approved &&
    approvalState.approvalStatusId !== ApprovalStatus.Denied &&
    approvalState.approvalStatusId !== ApprovalStatus.PartiallyApproved &&
    approvalState.approvalStatusId !== ApprovalStatus.ApprovalRequired
  ) {
    return <></>;
  }

  const countOfComments = props.actingAsEmployee
    ? approvalState.comments.filter(x => x.commentIsPublic).length
    : approvalState.comments.length;

  return (
    <>
      <ApproveDenyDialog
        open={approveDialogOpen}
        onClose={onCloseDialog}
        approvalStateId={approvalState.id}
        onApproveDeny={props.onChange}
      />
      <CommentDialog
        open={commentDialogOpen}
        onClose={onCloseDialog}
        approvalStateId={approvalState.id}
        actingAsEmployee={props.actingAsEmployee}
        onSaveComment={props.onChange}
        approvalWorkflowId={approvalState.approvalWorkflowId}
      />

      <div
        className={clsx({
          [classes.container]: true,
          [classes.approved]:
            approvalState.approvalStatusId === ApprovalStatus.Approved,
          [classes.denied]:
            approvalState.approvalStatusId === ApprovalStatus.Denied,
          [classes.pending]:
            approvalState.approvalStatusId ===
              ApprovalStatus.PartiallyApproved ||
            approvalState.approvalStatusId === ApprovalStatus.ApprovalRequired,
        })}
      >
        <div className={classes.buttonContainer}>
          <div className={classes.progressContainer}>
            <div className={classes.statusText}>
              {approvalState.approvalStatusId == ApprovalStatus.Approved
                ? t("Approved")
                : approvalState.approvalStatusId == ApprovalStatus.Denied
                ? props.actingAsEmployee
                  ? `${t("Denied")} - ${t("You may edit and resubmit")}`
                  : t("Denied")
                : `${t("Pending approval from")} ${
                    approvalState.pendingApproverGroupHeaderName
                  }`}
            </div>
            <LinearProgress
              className={classes.progress}
              variant="determinate"
              value={barPercentage}
              classes={{
                barColorPrimary:
                  approvalState.approvalStatusId == ApprovalStatus.Approved
                    ? classes.approvedBar
                    : approvalState.approvalStatusId == ApprovalStatus.Denied
                    ? classes.deniedBar
                    : classes.pendingBar,
                colorPrimary: classes.unfilledBar,
              }}
            />
          </div>
          <div className={classes.button}>
            {approvalState.canApprove ? (
              <Button variant="outlined" onClick={onOpenApproveDialog}>
                {t("Approve/Deny")}
              </Button>
            ) : (
              allowComments && (
                <Button variant="outlined" onClick={onOpenCommentDialog}>
                  {t("Comment")}
                </Button>
              )
            )}
          </div>
        </div>
        <div className={classes.detailsContainer}>
          <img
            src={require("ui/icons/comment.svg")}
            className={classes.commentIcon}
          />
          <div>{`${countOfComments} ${t("comments")}`}</div>
          <Link
            to={
              props.isTrueVacancy
                ? VacancyApprovalViewRoute.generate({
                    organizationId: props.orgId,
                    vacancyId: props.vacancyId!,
                  })
                : props.actingAsEmployee
                ? EmployeeAbsenceApprovalViewRoute.generate({
                    absenceId: props.absenceId!,
                  })
                : AdminAbsenceApprovalViewRoute.generate({
                    organizationId: props.orgId,
                    absenceId: props.absenceId!,
                  })
            }
            className={classes.link}
          >
            {t("View details")}
          </Link>
        </div>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    width: "100%",
  },
  buttonContainer: {
    display: "flex",
    alignItems: "space-between",
  },
  button: {
    paddingLeft: theme.spacing(4),
  },
  detailsContainer: {
    paddingTop: theme.spacing(0.5),
    display: "flex",
  },
  progressContainer: {
    width: "85%",
  },
  link: {
    paddingLeft: theme.spacing(1),
    color: theme.customColors.black,
  },
  progress: {
    height: "10px",
    borderRadius: "10px",
  },
  unfilledBar: {
    backgroundColor: "#FFFFFF",
  },
  approved: {
    border: "1px solid #4CC17C",
    background: "rgba(76, 193, 124, 0.2)",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  approvedBar: {
    backgroundColor: "#4CC17C",
  },
  denied: {
    border: "1px solid #C62828",
    background: "#FFDDDD",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  deniedBar: {
    backgroundColor: "#C62828",
  },
  pending: {
    border: "1px solid #FFCC01",
    background: "#FFF5CC",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  pendingBar: {
    backgroundColor: "#FFCC01",
  },
  statusText: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
  },
  commentIcon: {
    marginRight: theme.spacing(0.7),
  },
}));
