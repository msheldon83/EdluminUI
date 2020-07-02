import * as React from "react";
import { Section } from "ui/components/section";
import { Grid, makeStyles } from "@material-ui/core";
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
  approvalStateId: string;
  canApprove: boolean;
  approvalWorkflowId: string;
  approvalWorkflowName: string;
  approvalStatusId: ApprovalStatus;
  currentStepId?: string | null;
  approvalWorkflowSteps: ApprovalWorkflowSteps[];
  comments: {
    stepId: string;
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
    stepId: string;
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
  const isMobile = useIsMobile();
  const classes = useStyles({ isMobile });

  const currentStep = props.approvalWorkflowSteps.find(
    x => x.stepId === props.currentStepId
  );
  const nextStep = props.approvalWorkflowSteps.find(
    x => x.stepId === currentStep?.onApproval[0].goto && !x.isLastStep
  );
  const previousSteps = compact(
    props.decisions
      .filter(
        x => !x.hasBeenReset && x.approvalActionId !== ApprovalAction.Reset
      )
      .map(x => {
        const previousStep = props.approvalWorkflowSteps.find(
          y => y.stepId === x.stepId
        );
        if (previousStep) {
          return {
            stepId: previousStep.stepId,
            approverGroupHeaderName:
              previousStep.approverGroupHeader?.name ?? "",
          };
        }
      })
  );

  const locationIds =
    compact(
      props.isTrueVacancy
        ? props.vacancy?.details?.map(x => x?.locationId)
        : props.absence?.locationIds
    ) ?? [];

  const renderAbsVacDetail = () => {
    return (
      <div className={classes.absVacDetailsContainer}>
        {!props.isTrueVacancy
          ? props.absence && (
              <div>
                <AbsenceDetails
                  orgId={props.orgId}
                  absence={props.absence}
                  actingAsEmployee={props.actingAsEmployee}
                  showSimpleDetail={true}
                />
                {// We are not showing the context to the employee as its felt that the employee doesn't need it. However, I'm leaving the code in place in case we do want to show the user their absences.
                !props.actingAsEmployee && (
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
                )}
              </div>
            )
          : props.vacancy && (
              <div>
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
                    compact(props.vacancy?.details?.map(x => x?.locationId)) ??
                    []
                  }
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
              approvalStateId={props.approvalStateId}
              onApprove={props.onApprove}
              onDeny={props.onDeny}
              onSkip={props.onSkip}
              onReset={props.onReset}
              orgId={props.orgId}
              currentApproverGroupName={
                currentStep?.approverGroupHeader?.name ?? ""
              }
              showSkip={nextStep !== undefined}
              showReset={previousSteps.length > 0}
              previousSteps={previousSteps}
              nextApproverGroupName={nextStep?.approverGroupHeader?.name ?? ""}
              canApprove={props.canApprove}
            />
          </div>
          <WorkflowSummary
            currentStepId={props.currentStepId}
            steps={props.approvalWorkflowSteps}
            workflowName={props.approvalWorkflowName}
            decisions={props.decisions}
          />
          <ApprovalComments
            orgId={props.orgId}
            approvalStateId={props.approvalStateId}
            actingAsEmployee={props.actingAsEmployee}
            comments={props.comments}
            decisions={props.decisions}
            onCommentSave={props.onSaveComment}
            approvalWorkflowId={props.approvalWorkflowId}
            steps={props.approvalWorkflowSteps}
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
