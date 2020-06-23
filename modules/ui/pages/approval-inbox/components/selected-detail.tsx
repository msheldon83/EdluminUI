import * as React from "react";
import { Grid, makeStyles, Divider } from "@material-ui/core";
import { useMemo } from "react";
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
import { ApproveDenyButtons } from "ui/components/absence-vacancy/approval-state/approve-deny-buttons";
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
      id: props.selectedItem?.id,
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
  const currentApproverGroupHeaderId = approvalWorkflowSteps.find(
    x => x.stepId == approvalState?.currentStepId
  )?.approverGroupHeaderId;

  const handleSaveComment = async () => {
    if (props.selectedItem?.isNormalVacancy) {
      await getVacancy.refetch();
    } else {
      await getAbsence.refetch();
    }
  };

  return props.selectedItem ? (
    <div className={classes.backgroundContainer}>
      {!props.selectedItem?.isNormalVacancy && absence && (
        <div className={classes.container}>
          <div className={classes.summaryContainer}>
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
              locationIds={absence.locationIds}
              decisions={absence.approvalState?.decisions}
              absVacId={absence.id}
            />
            <div className={!isMobile ? classes.buttonContainer : undefined}>
              <ApproveDenyButtons
                approvalStateId={approvalState?.id ?? ""}
                approvalStatus={approvalState?.approvalStatusId}
                currentApproverGroupHeaderId={currentApproverGroupHeaderId}
                onApprove={props.onApprove}
                onDeny={props.onDeny}
              />
            </div>
          </div>
          <AbsenceDetails
            orgId={props.orgId}
            absence={absence}
            showSimpleDetail={false}
          />
        </div>
      )}
      {props.selectedItem?.isNormalVacancy && vacancy && (
        <div className={classes.container}>
          <div className={classes.summaryContainer}>
            <SummaryDetails
              orgId={props.orgId}
              createdLocal={vacancy.createdLocal}
              approvalChangedLocal={vacancy.approvalState?.changedLocal}
              positionTitle={vacancy.position?.title}
              startDate={vacancy.startDate}
              endDate={vacancy.endDate}
              isNormalVacancy={true}
              simpleSummary={false}
              locationIds={compact(vacancy.details.map(x => x.locationId))}
              decisions={vacancy.approvalState?.decisions}
              absVacId={vacancy.id}
            />
            <div className={!isMobile ? classes.buttonContainer : undefined}>
              <ApproveDenyButtons
                approvalStateId={approvalState?.id ?? ""}
                approvalStatus={approvalState?.approvalStatusId}
                currentApproverGroupHeaderId={currentApproverGroupHeaderId}
                onApprove={props.onApprove}
                onDeny={props.onDeny}
              />
            </div>
          </div>
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
          currentStepId={approvalState?.currentStepId ?? ""}
          steps={approvalWorkflowSteps}
          workflowName={approvalState?.approvalWorkflow?.name ?? ""}
        />
      </Grid>
      <Grid item xs={12}>
        <ApprovalComments
          orgId={props.orgId}
          approvalStateId={approvalState?.id ?? ""}
          comments={approvalState?.comments ?? []}
          decisions={approvalState?.decisions ?? []}
          onCommentSave={handleSaveComment}
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
  summaryContainer: (props: StyleProps) => ({
    display: props.isMobile ? "initial" : "flex",
    position: "relative",
  }),
  buttonContainer: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  container: {
    width: "100%",
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));
