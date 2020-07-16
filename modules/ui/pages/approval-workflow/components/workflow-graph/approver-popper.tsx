import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ApproverGroupSelect } from "ui/components/domain-selects/approver-group-select/approver-group-select";
import { Section } from "ui/components/section";
import { createNewStep } from "../../types";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { AbsVacTransitions } from "./components/abs-vac-transitions";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave: (step: ApprovalWorkflowStepInput) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  selectedStep?: ApprovalWorkflowStepInput | null;
  approverGroups: { id: string; name: string }[];
  reasons: {
    id: string;
    name: string;
  }[];
  previousStepId?: string;
  nextStepId?: string;
};

export const AddUpdateApprover: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { selectedStep } = props;
  const firstStep = selectedStep?.isFirstStep;

  const [step, setStep] = useState<ApprovalWorkflowStepInput>(
    selectedStep
      ? selectedStep
      : createNewStep(props.steps, props.nextStepId, props.previousStepId)
  );

  useEffect(() => {
    if (selectedStep && selectedStep.stepId !== step.stepId) {
      setStep(selectedStep);
    }
  }, [selectedStep, step.stepId]);

  const onSetGroup = (ids?: string[]) => {
    if (ids && ids.length > 0) {
      step.approverGroupHeaderId = ids[0];
    } else {
      step.approverGroupHeaderId = null;
    }
  };

  const handleSave = () => {
    props.onSave(step);
  };

  const handleUpdateTransitions = (step: ApprovalWorkflowStepInput) => {
    setStep(step);
  };

  const approverGroupIdsToFilterOut = compact(
    props.steps
      .filter(x => !x.deleted)
      .map(x => {
        if (
          !step ||
          (step && step.approverGroupHeaderId != x.approverGroupHeaderId)
        ) {
          return x.approverGroupHeaderId;
        }
      })
  );

  return (
    <div className={classes.popper}>
      <Section>
        <div className={classes.labelText}>
          {firstStep
            ? t("When workflow starts...")
            : t("Wait for approval from")}
        </div>
        {!firstStep && (
          <div className={classes.selectContainer}>
            <ApproverGroupSelect
              orgId={props.orgId}
              multiple={false}
              selectedApproverGroupHeaderIds={
                step.approverGroupHeaderId
                  ? [step.approverGroupHeaderId]
                  : undefined
              }
              setSelectedApproverGroupHeaderIds={onSetGroup}
              idsToFilterOut={approverGroupIdsToFilterOut}
            />
          </div>
        )}
        <AbsVacTransitions
          workflowType={props.workflowType}
          approverGroups={props.approverGroups}
          reasons={props.reasons}
          steps={props.steps}
          step={step}
          onChange={handleUpdateTransitions}
        />
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            onClick={handleSave}
            className={classes.button}
          >
            {step.approverGroupHeaderId || firstStep ? t("Update") : t("Add")}
          </Button>
          {props.onRemove && !firstStep && (
            <Button
              variant="outlined"
              onClick={props.onRemove}
              className={classes.button}
            >
              {t("Remove")}
            </Button>
          )}
          <Button
            variant="text"
            onClick={() => props.onClose()}
            className={classes.button}
          >
            {t("Close")}
          </Button>
        </div>
      </Section>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  labelText: {
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(14),
  },
  buttonContainer: {
    display: "flex",
    paddingTop: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(2),
  },
  selectContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  gotoNameContainer: {
    display: "flex",
  },
  gotoName: {
    flex: 2,
  },
  gotoCondition: {
    flex: 3,
    paddingLeft: theme.spacing(2),
  },
  popper: {
    width: "350px",
  },
}));
