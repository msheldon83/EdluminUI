import * as React from "react";
import { Section } from "ui/components/section";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import {
  ApprovalAction,
  Maybe,
  DayPart,
  AbsenceReasonTrackingTypeId,
  ApprovalStatus,
} from "graphql/server-types.gen";
import { ApprovalComments } from "./comments";
import { WorkflowSummary } from "./approval-flow";
import { useApproverGroups } from "ui/components/domain-selects/approver-group-select/approver-groups";
import { VacancyDetails } from "./vacancy-details";
import { AbsenceDetails } from "./absence-details";
import { compact, groupBy, flatMap, round } from "lodash-es";
import { Context } from "./context";
import { ApproveDenyButtons } from "./approve-deny-buttons";
import { ApprovalWorkflowSteps } from "./types";

type Props = {
  orgId: string;
  onApprove?: () => void;
  onDeny?: () => void;
  actingAsEmployee?: boolean;
  approvalStateId: string;
  approvalStatusId: ApprovalStatus;
  currentStepId: string;
  approvalWorkflowSteps: ApprovalWorkflowSteps[];
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
  isTrueVacancy: boolean;
  vacancy?: {
    id: string;
    adminOnlyNotes?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    details?:
      | Maybe<{
          startDate: string;
          endDate: string;
          locationId: string;
          vacancyReason: {
            id: string;
            name: string;
          };
        }>[]
      | null;
  } | null;
  absence?: {
    id: string;
    employeeId: string;
    employee?: {
      firstName: string;
      lastName: string;
    } | null;
    notesToApprover?: string | null;
    adminOnlyNotes?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    locationIds: string[];
    details?:
      | Maybe<{
          dayPartId?: DayPart | null;
          dayPortion: number;
          endTimeLocal?: string | null;
          startTimeLocal?: string | null;
          reasonUsages?:
            | Maybe<{
                amount: number;
                absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
                absenceReasonId: string;
                absenceReason?: {
                  name: string;
                } | null;
              }>[]
            | null;
        }>[]
      | null;
  };
  onSaveComment?: () => void;
};

export const ApprovalDetail: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const approverGroups = useApproverGroups(props.orgId);

  const currentApproverGroupHeaderId = props.approvalWorkflowSteps.find(
    x => x.stepId == props.currentStepId
  )?.approverGroupHeaderId;

  const absence = props.absence;
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

  return (
    <Section>
      <Grid container spacing={2}>
        {!props.isTrueVacancy && props.absence && (
          <Grid item xs={6} spacing={2}>
            <AbsenceDetails
              orgId={props.orgId}
              absence={props.absence}
              absenceReasons={absenceReasons}
              actingAsEmployee={props.actingAsEmployee}
              showSimpleDetail={true}
            />
            <Context
              orgId={props.orgId}
              employeeId={props.absence.employeeId}
              absenceId={props.absence.id}
              employeeName={`${props.absence.employee?.firstName} ${props.absence.employee?.lastName}`}
              locationIds={props.absence.locationIds}
              startDate={props.absence.startDate}
              endDate={props.absence.endDate}
              actingAsEmployee={props.actingAsEmployee}
              isNormalVacancy={false}
            />
          </Grid>
        )}
        {props.isTrueVacancy && props.vacancy && (
          <Grid item xs={6}>
            <VacancyDetails
              orgId={props.orgId}
              vacancy={props.vacancy}
              showSimpleDetail={true}
            />
            <Context
              orgId={props.orgId}
              vacancyId={props.vacancy?.id ?? ""}
              startDate={props.vacancy?.startDate}
              endDate={props.vacancy?.endDate}
              locationIds={
                compact(props.vacancy?.details?.map(x => x?.locationId)) ?? []
              }
              isNormalVacancy={true}
            />
          </Grid>
        )}
        <Grid item xs={6}>
          <Grid item container alignItems="center" justify="flex-end" xs={12}>
            <ApproveDenyButtons
              approvalStateId={props.approvalStateId}
              approvalStatus={props.approvalStatusId}
              currentApproverGroupHeaderId={currentApproverGroupHeaderId}
              onApprove={props.onApprove}
              onDeny={props.onDeny}
            />
          </Grid>
          <Grid item xs={12}>
            <WorkflowSummary
              approverGroups={approverGroups}
              currentStepId={props.currentStepId}
              steps={props.approvalWorkflowSteps}
            />
          </Grid>
          <Grid item xs={12}>
            <ApprovalComments
              orgId={props.orgId}
              approvalStateId={props.approvalStateId}
              actingAsEmployee={props.actingAsEmployee}
              comments={props.comments}
              decisions={props.decisions}
              onCommentSave={props.onSaveComment}
            />
          </Grid>
        </Grid>
      </Grid>
    </Section>
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
}));
