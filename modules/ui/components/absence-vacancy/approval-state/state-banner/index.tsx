import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, makeStyles, LinearProgress } from "@material-ui/core";
import { ApprovalStatus } from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { VacancyApprovalViewRoute } from "ui/routes/vacancy";
import {
  AdminAbsenceApprovalViewRoute,
  EmployeeAbsenceApprovalViewRoute,
} from "ui/routes/edit-absence";
import { ApproveDenyDialog } from "./approve-dialog";
import { CommentDialog } from "./comment-dialog";
import { useMyApproverGroupHeaders } from "reference-data/my-approver-group-headers";
import { useMyApprovalWorkflows } from "reference-data/my-approval-workflows";
import { useMyUserAccess } from "reference-data/my-user-access";
import { ApprovalWorkflowSteps } from "../types";

type Props = {
  orgId: string;
  approvalStateId: string;
  approvalWorkflowId: string;
  approvalStatusId: ApprovalStatus;
  approvalWorkflowSteps: ApprovalWorkflowSteps[];
  currentStepId: string;
  countOfComments: number;
  actingAsEmployee?: boolean;
  absenceId?: string;
  vacancyId?: string;
  isTrueVacancy: boolean;
  onChange?: () => void;
  locationIds: string[];
};

export const ApprovalState: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    approvalWorkflowSteps,
    approvalWorkflowId,
    actingAsEmployee,
    approvalStatusId,
  } = props;

  const userAccess = useMyUserAccess();
  const myApproverGroupHeaders = useMyApproverGroupHeaders();
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

  const currentStep = approvalWorkflowSteps.find(
    x => x.stepId === props.currentStepId
  );

  const orderSteps = useMemo(() => {
    const orderedSteps: { stepId: string | null | undefined }[] = [];
    let step = approvalWorkflowSteps.find(s => s.isFirstStep);
    orderedSteps.push({ stepId: step?.stepId });
    do {
      step = approvalWorkflowSteps.find(
        s => s.stepId === step?.onApproval.find(x => x.criteria === null)?.goto
      );
      orderedSteps.push({ stepId: step?.stepId });
    } while (step && !step?.isLastStep);

    return compact(orderedSteps);
  }, [approvalWorkflowSteps]);

  const barPercentage =
    (orderSteps.findIndex(x => x.stepId === props.currentStepId) /
      orderSteps.length -
      2) *
    100;

  const allowComments = useMemo(() => {
    if (actingAsEmployee) return true;

    // If I'm a member of the current group that needs to approve, show the buttons
    if (myApprovalWorkflows.find(x => x.id === approvalWorkflowId)) return true;
    return false;
  }, [actingAsEmployee, myApprovalWorkflows, approvalWorkflowId]);

  const showApproveDenyButtons = useMemo(() => {
    // Sys Admins are unable to approve or deny unless impersonating
    if (userAccess?.isSysAdmin) return false;

    // If the state is not pending, it has already been approved or denied
    if (approvalStatusId !== ApprovalStatus.Pending) return false;

    // If I'm a member of the current group that needs to approve, show the buttons
    const approverGroupHeader = currentStep?.approverGroupHeaderId
      ? myApproverGroupHeaders.find(
          x => x.id === currentStep.approverGroupHeaderId
        )
      : null;
    if (approverGroupHeader && !approverGroupHeader.variesByLocation)
      return true;

    // TODO: handle location based groups
    return false;
  }, [
    userAccess?.isSysAdmin,
    approvalStatusId,
    currentStep?.approverGroupHeaderId,
    myApproverGroupHeaders,
  ]);

  switch (props.approvalStatusId) {
    case ApprovalStatus.Approved:
      return (
        <div className={[classes.container, classes.approved].join(" ")}>
          <div className={classes.statusText}>{t("Approved")}</div>
          <LinearProgress
            className={classes.progress}
            variant="determinate"
            value={100}
            classes={{
              barColorPrimary: classes.approvedBar,
              colorPrimary: classes.unfilledBar,
            }}
          />
        </div>
      );
    case ApprovalStatus.Denied:
      return (
        <div className={[classes.container, classes.denied].join(" ")}>
          <div className={classes.statusText}>{t("Denied")}</div>
          <LinearProgress
            className={classes.progress}
            variant="determinate"
            value={barPercentage}
            classes={{
              barColorPrimary: classes.deniedBar,
              colorPrimary: classes.unfilledBar,
            }}
          />
        </div>
      );
    case ApprovalStatus.Pending:
      return (
        <>
          <ApproveDenyDialog
            open={approveDialogOpen}
            onClose={onCloseDialog}
            approvalStateId={props.approvalStateId}
            onApproveDeny={props.onChange}
          />
          <CommentDialog
            open={commentDialogOpen}
            onClose={onCloseDialog}
            approvalStateId={props.approvalStateId}
            actingAsEmployee={props.actingAsEmployee}
            onSaveComment={props.onChange}
            approvalWorkflowId={props.approvalWorkflowId}
          />
          <div className={[classes.container, classes.pending].join(" ")}>
            <div className={classes.buttonContainer}>
              <div className={classes.progressContainer}>
                <div className={classes.statusText}>{`${t(
                  "Pending approval from"
                )} ${currentStep?.approverGroupHeader?.name}`}</div>
                <LinearProgress
                  className={classes.progress}
                  variant="determinate"
                  value={barPercentage}
                  classes={{
                    barColorPrimary: classes.pendingBar,
                    colorPrimary: classes.unfilledBar,
                  }}
                />
              </div>
              <div className={classes.button}>
                {showApproveDenyButtons ? (
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
              <div>{`${props.countOfComments} ${t("comments")}`}</div>
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
    default:
      return <></>;
  }
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
