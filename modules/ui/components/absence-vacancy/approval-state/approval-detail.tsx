import * as React from "react";
import { Section } from "ui/components/section";
import {
  Grid,
  makeStyles,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
} from "@material-ui/core";
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
import { AbsenceContext } from "./context-absence";
import { AbsenceDetails } from "./absence-details";
import { compact, groupBy, flatMap } from "lodash-es";

type Props = {
  orgId: string;
  viewingAsEmployee?: boolean;
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
  vacancyId?: string;
  isTrueVacancy: boolean;
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

  console.log(props.absence);

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
          <Grid item container xs={6} spacing={2}>
            <Grid item xs={12}>
              <AbsenceDetails
                orgId={props.orgId}
                absence={props.absence}
                absenceReasons={absenceReasons}
              />
            </Grid>
            <Grid item xs={12}>
              <AbsenceContext
                orgId={props.orgId}
                employeeId={props.absence.employeeId}
                absenceId={props.absence.id}
                employeeName={`${props.absence.employee?.firstName} ${props.absence.employee?.lastName}`}
                locationIds={props.absence.locationIds}
                startDate={props.absence.startDate}
                endDate={props.absence.endDate}
                absenceReasons={absenceReasons}
              />
            </Grid>
          </Grid>
        )}
        <Grid item container xs={6} spacing={2}>
          <Grid item container xs={12} spacing={2} justify="flex-end">
            <Button
              className={classes.denyButton}
              variant="contained"
              onClick={handleDeny}
            >
              {t("Deny")}
            </Button>
            <Button
              className={classes.approveButton}
              variant="contained"
              onClick={handleApprove}
            >
              {t("Approve")}
            </Button>
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
              viewingAsEmployee={props.viewingAsEmployee}
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
  buttonContainer: {
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    alignItems: "space-between",
  },
}));
