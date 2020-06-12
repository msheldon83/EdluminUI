import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, makeStyles, LinearProgress } from "@material-ui/core";
import { ApprovalStatus } from "graphql/server-types.gen";
import { useQueryBundle } from "graphql/hooks";
import { GetApprovalWorkflowById } from "../graphql/get-approval-workflow-steps-by-id.gen";
import { GetApproverGroupHeaderById } from "../graphql/get-approver-group-by-id.gen";
import { compact } from "lodash-es";
import { VacancyApprovalViewRoute } from "ui/routes/vacancy";
import {
  AdminAbsenceApprovalViewRoute,
  EmployeeAbsenceApprovalViewRoute,
} from "ui/routes/edit-absence";
import { ApproveDenyDialog } from "./approve-dialog";
import { CommentDialog } from "./comment-dialog";
import { useMyApproverGroupHeaders } from "reference-data/my-approver-group-headers";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  orgId: string;
  approvalStateId: string;
  approvalStatusId: ApprovalStatus;
  approvalWorkflowId: string;
  currentStepId: string;
  countOfComments: number;
  actingAsEmployee?: boolean;
  absenceId?: string;
  vacancyId?: string;
  isTrueVacancy: boolean;
  onChange?: () => void;
};

export const ApprovalState: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const userAccess = useMyUserAccess();
  const myApproverGroupHeaders = useMyApproverGroupHeaders();

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

  const getApprovalWorkflow = useQueryBundle(GetApprovalWorkflowById, {
    variables: {
      id: props.approvalWorkflowId,
    },
    skip:
      props.approvalStatusId !== ApprovalStatus.Denied &&
      props.approvalStatusId !== ApprovalStatus.Pending,
  });

  const approvalWorkflow =
    getApprovalWorkflow.state === "DONE"
      ? getApprovalWorkflow.data.approvalWorkflow?.byId
      : null;
  const currentStep = approvalWorkflow?.steps.find(
    x => x.stepId === props.currentStepId
  );
  const approverGroupId = currentStep?.approverGroupHeaderId;

  const getApproverGroup = useQueryBundle(GetApproverGroupHeaderById, {
    variables: {
      approverGroupHeaderId: approverGroupId ?? "",
    },
    skip: !approverGroupId,
  });
  const approverGroup =
    getApproverGroup.state === "DONE"
      ? getApproverGroup.data.approverGroup?.byId
      : null;

  const orderSteps = useMemo(() => {
    if (approvalWorkflow) {
      const orderedSteps: { stepId: string | null | undefined }[] = [];
      let step = approvalWorkflow?.steps.find(s => s.isFirstStep);
      orderedSteps.push({ stepId: step?.stepId });
      do {
        step = approvalWorkflow?.steps.find(
          s =>
            s.stepId === step?.onApproval.find(x => x.criteria === null)?.goto
        );
        orderedSteps.push({ stepId: step?.stepId });
      } while (step && !step?.isLastStep);

      return compact(orderedSteps);
    } else {
      return [];
    }
  }, [approvalWorkflow]);

  const barPercentage =
    (orderSteps.findIndex(x => x.stepId === props.currentStepId) /
      orderSteps.length) *
    100;

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
      return approvalWorkflow ? (
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
          />
          <div className={[classes.container, classes.pending].join(" ")}>
            <div className={classes.buttonContainer}>
              <div className={classes.progressContainer}>
                <div className={classes.statusText}>{`${t(
                  "Pending approval from"
                )} ${approverGroup?.name}`}</div>
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
                {props.actingAsEmployee ? (
                  <Button variant="outlined" onClick={onOpenCommentDialog}>
                    {t("Comment")}
                  </Button>
                ) : (
                  !userAccess?.isSysAdmin &&
                  myApproverGroupHeaders.find(
                    x => x.id === approverGroupId
                  ) && (
                    <Button variant="outlined" onClick={onOpenApproveDialog}>
                      {t("Approve/Deny")}
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
      ) : (
        <></>
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
