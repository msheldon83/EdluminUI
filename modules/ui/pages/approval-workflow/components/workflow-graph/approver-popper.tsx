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
  ApprovalWorkflowTransitionInput,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { AbsVacTransitions } from "./components/abs-vac-transitions";
import { Formik } from "formik";
import * as Yup from "yup";
import { ConditionPopper } from "./condition-popper";
import { TextButton } from "ui/components/text-button";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave: (steps: ApprovalWorkflowStepInput[]) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  selectedStep?: ApprovalWorkflowStepInput | null;
  approverGroups: { id: string; name: string }[];
  reasons: {
    id: string;
    name: string;
  }[];
  previousStepId?: string;
  nextStepId?: string | null;
};

export const AddUpdateApprover: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [conditionOpen, setConditionOpen] = useState(false);
  const [nextStepId, setNextStepId] = useState(props.nextStepId);

  const { selectedStep } = props;
  const firstStep = selectedStep?.isFirstStep;

  const [newSteps, setNewSteps] = useState<ApprovalWorkflowStepInput[]>([]);
  const [step, setStep] = useState<ApprovalWorkflowStepInput>(
    selectedStep
      ? selectedStep
      : createNewStep(props.steps, props.nextStepId, props.previousStepId)
  );

  useEffect(() => {
    if (selectedStep && selectedStep.stepId !== step.stepId) {
      setStep(selectedStep);
      setNewSteps([]);
    }
  }, [selectedStep, step.stepId]);

  // We need to only show Approver Groups in the select that haven't been used yet
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

  const onSaveConditionUpdate = (updatedSteps: ApprovalWorkflowStepInput[]) => {
    const updatedStep = updatedSteps.find(x => x.stepId === step.stepId);
    if (updatedStep) setStep(updatedStep);
    setNewSteps(updatedSteps.filter(x => x.stepId !== step.stepId));
  };

  const handleSubmit = (data: ApprovalWorkflowStepInput) => {
    // If this is a new step being added as the default route of another step,
    // we need to update the source step's default transition
    const previousStep = props.steps.find(
      x => x.stepId === props.previousStepId
    );
    if (!props.steps.find(x => x.stepId === data.stepId) && previousStep) {
      previousStep.onApproval[previousStep.onApproval.length - 1].goto =
        data.stepId;
      props.onSave([data, previousStep]);
    } else {
      // Handle updating the selected step and adding any new steps created by adding conditions
      newSteps.length > 0
        ? props.onSave([...newSteps, data])
        : props.onSave([data]);
    }
  };

  return conditionOpen ? (
    <ConditionPopper
      orgId={props.orgId}
      workflowType={props.workflowType}
      onClose={() => setConditionOpen(false)}
      onSave={onSaveConditionUpdate}
      steps={props.steps}
      selectedStep={step}
      previousStepId={step.stepId}
      nextStepId={nextStepId}
    />
  ) : (
    <div className={classes.popper}>
      <Section>
        <div className={classes.labelText}>
          {firstStep
            ? t("When workflow starts...")
            : t("Wait for approval from")}
        </div>
        <Formik
          enableReinitialize
          initialValues={step}
          validationSchema={Yup.object().shape({
            isFirstStep: Yup.boolean(),
            approverGroupHeaderId: Yup.string().when("isFirstStep", {
              is: true,
              then: Yup.string().nullable(),
              otherwise: Yup.string()
                .nullable()
                .required(t("An approver group is required")),
            }),
          })}
          onSubmit={data => {
            handleSubmit(data);
            props.onClose();
          }}
        >
          {({ handleSubmit, submitForm, setFieldValue, values, errors }) => (
            <form onSubmit={handleSubmit}>
              {!firstStep && (
                <div className={classes.selectContainer}>
                  <ApproverGroupSelect
                    orgId={props.orgId}
                    multiple={false}
                    selectedApproverGroupHeaderIds={
                      values.approverGroupHeaderId
                        ? [values.approverGroupHeaderId]
                        : undefined
                    }
                    setSelectedApproverGroupHeaderIds={(ids?: string[]) => {
                      if (ids && ids.length > 0) {
                        setFieldValue("approverGroupHeaderId", ids[0]);
                      } else {
                        setFieldValue("approverGroupHeaderId", null);
                      }
                    }}
                    idsToFilterOut={approverGroupIdsToFilterOut}
                    errorMessage={errors.approverGroupHeaderId}
                  />
                </div>
              )}
              <AbsVacTransitions
                workflowType={props.workflowType}
                approverGroups={props.approverGroups}
                reasons={props.reasons}
                steps={props.steps.concat(newSteps)}
                transitions={values.onApproval}
                onUpdate={(onApproval: ApprovalWorkflowTransitionInput[]) =>
                  setFieldValue("onApproval", onApproval)
                }
                onEditTransition={(nextStepId?: string | null) => {
                  setNextStepId(nextStepId);
                  setConditionOpen(true);
                }}
              />
              <TextButton
                onClick={() => {
                  setNextStepId(undefined);
                  setConditionOpen(true);
                }}
                className={classes.addRoute}
              >
                {t("Add route")}
              </TextButton>
              <div className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  onClick={submitForm}
                  className={classes.button}
                >
                  {step.approverGroupHeaderId || firstStep
                    ? t("Update")
                    : t("Add")}
                </Button>
                {props.onRemove && !values.isFirstStep && (
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
            </form>
          )}
        </Formik>
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
  addRoute: {
    color: "#FF5555",
    textDecorationLine: "underline",
  },
}));
