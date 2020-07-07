import * as React from "react";
import { Grid, makeStyles, Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import { ApprovalComments } from "ui/components/absence-vacancy/approval-state/comments";
import { WorkflowSummary } from "ui/components/absence-vacancy/approval-state/approval-flow";
import { VacancyDetails } from "ui/components/absence-vacancy/approval-state/vacancy-details";
import { AbsenceDetails } from "ui/components/absence-vacancy/approval-state/absence-details";
import { compact } from "lodash-es";
import { Context } from "ui/components/absence-vacancy/approval-state/context";
import { GetVacancyById } from "../graphql/get-vacancy-by-id.gen";
import { GetAbsence } from "../graphql/get-absence-by-id.gen";
import { ApprovalActionButtons } from "ui/components/absence-vacancy/approval-state/approval-action-buttons";
import { SummaryDetails } from "ui/components/absence-vacancy/approval-state/summary-details";
import { useIsMobile } from "hooks";

type Props = {
  orgId: string;
  selectedItem: {
    id: string;
    isNormalVacancy: boolean;
  } | null;
  onApprove?: () => void;
  onDeny?: () => void;
};

export const SelectedDetail: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles({ isMobile });

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: {
      id: props.selectedItem?.id,
    },
    skip: props.selectedItem === null || !props.selectedItem?.isNormalVacancy,
  });

  const vacancy =
    getVacancy.state === "DONE" ? getVacancy.data.vacancy?.byId : null;

  const getAbsence = useQueryBundle(GetAbsence, {
    variables: {
      id: props.selectedItem?.id ?? "",
    },
    skip: props.selectedItem === null || props.selectedItem?.isNormalVacancy,
  });

  const absence =
    getAbsence.state === "DONE" ? getAbsence.data.absence?.byId : null;

  const approvalState = props.selectedItem
    ? props.selectedItem?.isNormalVacancy
      ? vacancy?.approvalState
      : absence?.approvalState
    : null;

  const approvalWorkflowSteps = approvalState?.approvalWorkflow.steps ?? [];
  const nextStep = approvalState?.nextSteps && approvalState.nextSteps[0];
  const previousSteps = compact(approvalState?.completedSteps) ?? [];

  const handleSaveCommentSkipOrReset = async () => {
    if (props.selectedItem?.isNormalVacancy) {
      await getVacancy.refetch();
    } else {
      await getAbsence.refetch();
    }
  };

  const locationIds =
    compact(
      props.selectedItem?.isNormalVacancy
        ? vacancy?.details?.map(x => x.locationId)
        : absence?.locationIds
    ) ?? [];

  return props.selectedItem ? (
    <div className={classes.backgroundContainer}>
      {!absence && !vacancy ? (
        <div className={classes.loadingText}>{`${t("Loading")} ${
          props.selectedItem?.isNormalVacancy ? t("vacancy") : t("absence")
        } ${props.selectedItem?.isNormalVacancy ? "#V" : "#"}${
          props.selectedItem?.id
        }`}</div>
      ) : (
        <>
          <div className={classes.buttonContainer}>
            <ApprovalActionButtons
              approvalStateId={approvalState?.id ?? ""}
              onApprove={props.onApprove}
              onDeny={props.onDeny}
              onSkip={handleSaveCommentSkipOrReset}
              onReset={handleSaveCommentSkipOrReset}
              orgId={props.orgId}
              currentApproverGroupName={
                approvalState?.pendingApproverGroupHeaderName ?? ""
              }
              showSkip={nextStep !== undefined}
              showReset={previousSteps.length > 0}
              previousSteps={previousSteps}
              nextApproverGroupName={nextStep?.approverGroupHeader?.name ?? ""}
              canApprove={approvalState?.canApprove ?? false}
            />
          </div>
          {!props.selectedItem?.isNormalVacancy && absence && (
            <div className={classes.container}>
              <SummaryDetails
                orgId={props.orgId}
                absenceDetails={absence.details}
                createdLocal={absence.createdLocal}
                approvalChangedLocal={absence.approvalState?.changedLocal}
                positionTitle={absence.employee?.primaryPosition?.title}
                employeeName={`${absence.employee?.firstName} ${absence.employee?.lastName}`}
                startDate={absence.startDate}
                endDate={absence.endDate}
                isNormalVacancy={false}
                simpleSummary={false}
                locationIds={locationIds}
                decisions={absence.approvalState?.decisions}
                absVacId={absence.id}
              />
              <AbsenceDetails
                orgId={props.orgId}
                absence={absence}
                showSimpleDetail={false}
              />
            </div>
          )}
          {props.selectedItem?.isNormalVacancy && vacancy && (
            <div className={classes.container}>
              <SummaryDetails
                orgId={props.orgId}
                createdLocal={vacancy.createdLocal}
                approvalChangedLocal={vacancy.approvalState?.changedLocal}
                positionTitle={vacancy.position?.title}
                startDate={vacancy.startDate}
                endDate={vacancy.endDate}
                isNormalVacancy={true}
                simpleSummary={false}
                locationIds={locationIds}
                decisions={vacancy.approvalState?.decisions}
                absVacId={vacancy.id}
              />
              <VacancyDetails
                orgId={props.orgId}
                vacancy={vacancy}
                showSimpleDetail={false}
              />
            </div>
          )}
          <Grid item xs={12}>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs={12}>
            <WorkflowSummary
              workflowName={approvalState?.approvalWorkflow.name ?? ""}
              pendingApproverGroupHeaderName={
                approvalState?.pendingApproverGroupHeaderName
              }
              deniedApproverGroupHeaderName={
                approvalState?.deniedApproverGroupHeaderName
              }
              approvedApproverGroupHeaderNames={
                approvalState?.approvedApproverGroupHeaderNames
              }
              nextSteps={approvalState?.nextSteps}
            />
          </Grid>
          <Grid item xs={12}>
            <ApprovalComments
              orgId={props.orgId}
              approvalStateId={approvalState?.id ?? ""}
              comments={approvalState?.comments ?? []}
              decisions={approvalState?.decisions ?? []}
              onCommentSave={handleSaveCommentSkipOrReset}
              approvalWorkflowId={approvalState?.approvalWorkflowId ?? ""}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider className={classes.divider} />
          </Grid>
          {!props.selectedItem?.isNormalVacancy && absence && (
            <Grid item xs={12}>
              <Context
                orgId={props.orgId}
                employeeId={absence.employeeId}
                absenceId={absence.id}
                employeeName={`${absence.employee?.firstName} ${absence.employee?.lastName}`}
                locationIds={absence.locationIds}
                startDate={absence.startDate}
                endDate={absence.endDate}
                isNormalVacancy={false}
              />
            </Grid>
          )}
          {props.selectedItem?.isNormalVacancy && vacancy && (
            <Grid item xs={12}>
              <Context
                orgId={props.orgId}
                vacancyId={vacancy?.id ?? ""}
                startDate={vacancy?.startDate}
                endDate={vacancy?.endDate}
                locationIds={
                  compact(vacancy?.details?.map(x => x?.locationId)) ?? []
                }
                isNormalVacancy={true}
              />
            </Grid>
          )}
        </>
      )}
    </div>
  ) : (
    <></>
  );
};

type StyleProps = {
  isMobile: boolean;
};

const useStyles = makeStyles(theme => ({
  approveButton: {
    background: "#4CC17C",
  },
  denyButton: {
    background: "#FF5555",
    marginRight: theme.spacing(1),
  },
  backgroundContainer: {
    background: "#F8F8F8",
    borderRadius: "4px",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    paddingRight: theme.spacing(1),
  },
  container: {
    width: "100%",
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  loadingText: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(18),
    padding: theme.spacing(4),
  },
}));
