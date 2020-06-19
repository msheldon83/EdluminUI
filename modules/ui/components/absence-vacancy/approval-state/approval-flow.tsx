import * as React from "react";
import { useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { compact } from "lodash-es";
import { useTranslation } from "react-i18next";
import { ApprovalWorkflowSteps } from "./types";

type Props = {
  steps: ApprovalWorkflowSteps[];
  currentStepId?: string | null;
};

export const WorkflowSummary: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const steps = props.steps;
  const currentStepId = props.currentStepId;

  const orderedSteps = useMemo(() => {
    const ordered: {
      stepId: string | null | undefined;
      approverGroupHeaderName: string | null | undefined;
    }[] = [];
    let step = steps.find(s => s.isFirstStep);
    do {
      step = steps.find(
        s => s.stepId === step?.onApproval.find(x => x.criteria === null)?.goto
      );
      ordered.push({
        stepId: step?.stepId,
        approverGroupHeaderName: step?.approverGroupHeader?.name,
      });
    } while (step && !step?.isLastStep);

    return compact(ordered);
  }, [steps]);

  const currentStepIndex = useMemo(
    () => orderedSteps.findIndex(x => x.stepId === currentStepId),
    [orderedSteps, currentStepId]
  );

  const approvedSteps = useMemo(() => orderedSteps.slice(0, currentStepIndex), [
    orderedSteps,
    currentStepIndex,
  ]);
  const pendingStep = useMemo(() => orderedSteps[currentStepIndex], [
    orderedSteps,
    currentStepIndex,
  ]);
  const nextSteps = useMemo(
    () => orderedSteps.slice(currentStepIndex + 1, orderedSteps.length),
    [orderedSteps, currentStepIndex]
  );

  const renderApprovedSteps = () => {
    return (
      <div>
        <div className={classes.titleText}>{t("Approved by:")}</div>
        <div className={classes.stepsContainer}>
          {approvedSteps.map((s, i) => {
            return (
              <div key={i} className={classes.approvedBox}>
                <span className={classes.groupNameText}>
                  {s.approverGroupHeaderName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPendingStep = () => {
    return pendingStep.approverGroupHeaderName ? (
      <div>
        <div className={classes.titleText}>{t("Pending:")}</div>
        <div className={classes.pendingBox}>
          <span className={classes.groupNameText}>
            {pendingStep.approverGroupHeaderName}
          </span>
        </div>
      </div>
    ) : (
      <></>
    );
  };

  const renderNextSteps = () => {
    return (
      <div>
        <div className={classes.titleText}>{t("Next:")}</div>
        <div className={classes.stepsContainer}>
          {nextSteps.map((s, i) => {
            if (s.approverGroupHeaderName) {
              return (
                <div key={i} className={classes.nextBox}>
                  <span className={classes.nextText}>
                    {s.approverGroupHeaderName}
                  </span>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={classes.container}>
      {approvedSteps.length > 0 && renderApprovedSteps()}
      {pendingStep && renderPendingStep()}
      {nextSteps.length > 1 && renderNextSteps()}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  stepsContainer: {
    display: "flex",
  },
  titleText: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
    marginBottom: theme.spacing(0.5),
  },
  groupNameText: {
    verticalAlign: "middle",
    display: "inline-block",
    lineHeight: "normal",
  },
  approvedBox: {
    border: "1px solid #4CC17C",
    background: "#E6F5ED",
    boxSizing: "border-box",
    width: "125px",
    height: "70px",
    lineHeight: "70px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  pendingBox: {
    border: "1px solid #050039",
    background: "#FFFFFF",
    boxSizing: "border-box",
    width: "125px",
    height: "70px",
    lineHeight: "70px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  nextBox: {
    border: "1px solid #9B99B0",
    boxSizing: "border-box",
    background: "#FFFFFF",
    width: "125px",
    height: "70px",
    lineHeight: "70px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  nextText: {
    color: "#8997B1",
    verticalAlign: "middle",
    display: "inline-block",
    lineHeight: "normal",
  },
}));
