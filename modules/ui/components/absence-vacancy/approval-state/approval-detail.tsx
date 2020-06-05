import * as React from "react";
import { Section } from "ui/components/section";
import { Grid, makeStyles, Button } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  ApprovalAction,
  Maybe,
  DayPart,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { Approve } from "./graphql/approve.gen";
import { Deny } from "./graphql/deny.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { ApprovalComments } from "./comments";
import { WorkflowSummary } from "./approval-flow";
import { useApproverGroups } from "ui/components/domain-selects/approver-group-select/approver-groups";
import { GetApprovalWorkflowById } from "./graphql/get-approval-workflow-steps-by-id.gen";
import { VacancyDetails } from "./vacancy-details";
import { AbsenceDetails } from "./absence-details";
import { compact, groupBy, flatMap } from "lodash-es";
import { Context } from "./context";

type Props = {
  orgId: string;
  actingAsEmployee?: boolean;
  approvalStateId: string;
  currentStepId: string;
  approvalWorkflowId: string;
  comments: {
    comment?: string | null;
    commentIsPublic: boolean;
    createdLocal?: string | null;
    actingOrgUser: {
      firstName: string;
      lastName: string;
    };
    approvalDecisionId?: string | null;
    approvalDecision?: {
      approvalActionId: ApprovalAction;
    } | null;
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
};

export const ApprovalDetail: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [approve] = useMutationBundle(Approve, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deny] = useMutationBundle(Deny, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleApprove = async () => {
    const result = await approve({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
        },
      },
    });
  };

  const handleDeny = async () => {
    const result = await deny({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
        },
      },
    });
  };

  const getApprovalWorkflow = useQueryBundle(GetApprovalWorkflowById, {
    variables: {
      id: props.approvalWorkflowId,
    },
  });
  const approvalWorkflow =
    getApprovalWorkflow.state === "DONE"
      ? getApprovalWorkflow.data.approvalWorkflow?.byId
      : null;

  const approverGroups = useApproverGroups(props.orgId);

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
            totalAmount: usages.reduce((m, v) => m + v.amount, 0),
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
            <VacancyDetails orgId={props.orgId} vacancy={props.vacancy} />
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
            <Grid item>
              <Button
                className={classes.denyButton}
                variant="contained"
                onClick={handleDeny}
              >
                {t("Deny")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                className={classes.approveButton}
                variant="contained"
                onClick={handleApprove}
              >
                {t("Approve")}
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <WorkflowSummary
              approverGroups={approverGroups}
              currentStepId={props.currentStepId}
              steps={approvalWorkflow?.steps ?? []}
            />
          </Grid>
          <Grid item xs={12}>
            <ApprovalComments
              orgId={props.orgId}
              approvalStateId={props.approvalStateId}
              actingAsEmployee={props.actingAsEmployee}
              comments={props.comments}
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
