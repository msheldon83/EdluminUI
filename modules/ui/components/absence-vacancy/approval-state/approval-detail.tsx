import * as React from "react";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  ApprovalAction,
  Maybe,
  DayPart,
  AbsenceReasonTrackingTypeId,
  ApprovalStatus,
} from "graphql/server-types.gen";
import { ApprovalComments } from "./comments";
import { WorkflowSummary } from "./approval-flow";
import { VacancyDetails } from "./vacancy-details";
import { AbsenceDetails } from "./absence-details";
import { compact } from "lodash-es";
import { Context } from "./context";
import { ApprovalActionButtons } from "./approval-action-buttons";
import { ApprovalWorkflowSteps } from "./types";
import { useIsMobile } from "hooks";

type Props = {
  orgId: string;
  onApprove?: () => void;
  onDeny?: () => void;
  onSkip?: () => void;
  onReset?: () => void;
  actingAsEmployee?: boolean;
  approvalState: {
    id: string;
    canApprove: boolean;
    approvalStatusId: ApprovalStatus;
    approvalWorkflowId: string;
    currentStepId?: string | null;
    pendingApproverGroupHeaderName?: string | null;
    deniedApproverGroupHeaderName?: string | null;
    approvedApproverGroupHeaderNames?: Maybe<string>[] | null;
    nextSteps?:
      | Maybe<{
          approverGroupHeader?: {
            name: string;
          } | null;
        }>[]
      | null;
    completedSteps?:
      | Maybe<{
          stepId: string;
          approverGroupHeader?: {
            name: string;
          } | null;
        }>[]
      | null;
    approvalWorkflow: {
      name: string;
      steps: ApprovalWorkflowSteps[];
    };
    comments: {
      stepId?: string | null;
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
      stepId?: string | null;
      approvalActionId: ApprovalAction;
      createdLocal?: string | null;
      hasBeenReset: boolean;
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
  };
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
                hourlyAmount: number;
                dailyAmount: number;
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
  const isMobile = useIsMobile();
  const classes = useStyles({ isMobile });

  const { approvalState, absence, vacancy, isTrueVacancy } = props;

  const nextStep = approvalState?.nextSteps && approvalState.nextSteps[0];
  const previousSteps = compact(approvalState?.completedSteps) ?? [];

  const locationIds =
    compact(
      isTrueVacancy
        ? vacancy?.details?.map(x => x?.locationId)
        : absence?.locationIds
    ) ?? [];

  const renderAbsVacDetail = () => {
    return (
      <div className={classes.absVacDetailsContainer}>
        {!isTrueVacancy
          ? absence && (
              <div>
                <AbsenceDetails
                  orgId={props.orgId}
                  absence={absence}
                  actingAsEmployee={props.actingAsEmployee}
                  showSimpleDetail={true}
                />
                {// We are not showing the context to the employee as its felt that the employee doesn't need it. However, I'm leaving the code in place in case we do want to show the user their absences.
                !props.actingAsEmployee && (
                  <Context
                    orgId={props.orgId}
                    employeeId={absence.employeeId}
                    absenceId={absence.id}
                    employeeName={`${absence.employee?.firstName} ${absence.employee?.lastName}`}
                    locationIds={locationIds}
                    startDate={absence.startDate}
                    endDate={absence.endDate}
                    actingAsEmployee={props.actingAsEmployee}
                    isNormalVacancy={false}
                  />
                )}
              </div>
            )
          : vacancy && (
              <div>
                <VacancyDetails
                  orgId={props.orgId}
                  vacancy={vacancy}
                  showSimpleDetail={true}
                />
                <Context
                  orgId={props.orgId}
                  vacancyId={vacancy?.id ?? ""}
                  startDate={vacancy?.startDate}
                  endDate={vacancy?.endDate}
                  locationIds={locationIds}
                  isNormalVacancy={true}
                />
              </div>
            )}
      </div>
    );
  };

  return (
    <Section>
      <div className={!isMobile ? classes.desktopContainer : undefined}>
        {!isMobile && renderAbsVacDetail()}
        <div className={classes.approvalDetailsContainer}>
          <div className={classes.buttonContainer}>
            <ApprovalActionButtons
              approvalStateId={approvalState.id}
              onApprove={props.onApprove}
              onDeny={props.onDeny}
              onSkip={props.onSkip}
              onReset={props.onReset}
              orgId={props.orgId}
              currentApproverGroupName={
                approvalState.pendingApproverGroupHeaderName ?? ""
              }
              showSkip={nextStep !== undefined}
              showReset={previousSteps.length > 0}
              previousSteps={previousSteps}
              nextApproverGroupName={nextStep?.approverGroupHeader?.name ?? ""}
              canApprove={approvalState.canApprove}
            />
          </div>
          <WorkflowSummary
            workflowName={approvalState.approvalWorkflow.name}
            pendingApproverGroupHeaderName={
              approvalState.pendingApproverGroupHeaderName
            }
            deniedApproverGroupHeaderName={
              approvalState.deniedApproverGroupHeaderName
            }
            approvedApproverGroupHeaderNames={
              approvalState.approvedApproverGroupHeaderNames
            }
            nextSteps={approvalState.nextSteps}
          />
          <ApprovalComments
            orgId={props.orgId}
            approvalStateId={approvalState.id}
            actingAsEmployee={props.actingAsEmployee}
            comments={approvalState.comments}
            decisions={approvalState.decisions}
            onCommentSave={props.onSaveComment}
            approvalWorkflowId={approvalState.approvalWorkflowId}
          />
        </div>
        {isMobile && renderAbsVacDetail()}
      </div>
    </Section>
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
  desktopContainer: {
    display: "flex",
  },
  buttonContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
  },
  absVacDetailsContainer: (props: StyleProps) => ({
    width: props.isMobile ? "100%" : "50%",
  }),
  approvalDetailsContainer: (props: StyleProps) => ({
    width: props.isMobile ? "100%" : "50%",
    paddingBottom: theme.spacing(4),
  }),
}));
