import * as React from "react";
import { Grid, makeStyles, Divider } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import { ApprovalComments } from "ui/components/absence-vacancy/approval-state/comments";
import { WorkflowSummary } from "ui/components/absence-vacancy/approval-state/approval-flow";
import { useApproverGroups } from "ui/components/domain-selects/approver-group-select/approver-groups";
import { GetApprovalWorkflowById } from "ui/components/absence-vacancy/approval-state/graphql/get-approval-workflow-steps-by-id.gen";
import { VacancyDetails } from "ui/components/absence-vacancy/approval-state/vacancy-details";
import { AbsenceDetails } from "ui/components/absence-vacancy/approval-state/absence-details";
import { compact, groupBy, flatMap, round } from "lodash-es";
import { Context } from "ui/components/absence-vacancy/approval-state/context";
import { GetVacancyById } from "ui/pages/vacancy/graphql/get-vacancy-byid.gen";
import { GetAbsence } from "ui/pages/edit-absence/graphql/get-absence.gen";
import { ApproveDenyButtons } from "ui/components/absence-vacancy/approval-state/approve-deny-buttons";

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
  const classes = useStyles();

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

  const getApprovalWorkflow = useQueryBundle(GetApprovalWorkflowById, {
    variables: {
      id: approvalState?.approvalWorkflowId ?? "",
    },
    skip: !approvalState?.approvalWorkflowId,
  });
  const approvalWorkflow =
    getApprovalWorkflow.state === "DONE"
      ? getApprovalWorkflow.data.approvalWorkflow?.byId
      : null;

  const currentApproverGroupHeaderId = useMemo(
    () =>
      approvalWorkflow?.steps.find(
        x => x.stepId == approvalState?.currentStepId
      )?.approverGroupHeaderId,
    [approvalWorkflow, approvalState]
  );

  const approverGroups = useApproverGroups(props.orgId);

  const absenceReasons = useMemo(
    () =>
      absence
        ? Object.entries(
            groupBy(
              flatMap(
                compact(absence.details).map(x => compact(x.reasonUsages))
              ),
              r => r?.absenceReasonId
            )
          ).map(([absenceReasonId, usages]) => ({
            absenceReasonId: absenceReasonId,
            absenceReasonTrackingTypeId: usages[0].absenceReasonTrackingTypeId,
            absenceReasonName: usages[0].absenceReason?.name,
            totalAmount: round(
              usages.reduce((m, v) => m + v.amount, 0),
              2
            ),
          }))
        : [],
    [absence]
  );

  return props.selectedItem ? (
    <Grid container spacing={2} className={classes.backgroundContainer}>
      <Grid item container alignItems="center" justify="flex-end" xs={12}>
        <ApproveDenyButtons
          approvalStateId={approvalState?.id ?? ""}
          approvalStatus={approvalState?.approvalStatusId}
          currentApproverGroupHeaderId={currentApproverGroupHeaderId}
          onApprove={props.onApprove}
          onDeny={props.onDeny}
        />
      </Grid>
      {!props.selectedItem?.isNormalVacancy && absence && (
        <Grid item xs={12}>
          <AbsenceDetails
            orgId={props.orgId}
            absence={absence}
            absenceReasons={absenceReasons}
          />
        </Grid>
      )}
      {props.selectedItem?.isNormalVacancy && vacancy && (
        <Grid item xs={12}>
          <VacancyDetails orgId={props.orgId} vacancy={vacancy} />
        </Grid>
      )}
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <WorkflowSummary
          approverGroups={approverGroups}
          currentStepId={approvalState?.currentStepId ?? ""}
          steps={approvalWorkflow?.steps ?? []}
        />
      </Grid>
      <Grid item xs={12}>
        <ApprovalComments
          orgId={props.orgId}
          approvalStateId={approvalState?.id ?? ""}
          comments={approvalState?.comments ?? []}
          decisions={approvalState?.decisions ?? []}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider />
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
    </Grid>
  ) : (
    <></>
  );
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
  },
}));
