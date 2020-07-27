import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ApproverGroupSelect } from "ui/components/domain-selects/approver-group-select/approver-group-select";
import { Section } from "ui/components/section";
import { createNewStep } from "../types";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
  ApprovalWorkflowTransitionInput,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { AbsVacTransitions } from "./abs-vac-transitions";
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
  originalSteps: ApprovalWorkflowStepInput[];
  modifiedSteps: ApprovalWorkflowStepInput[];
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

  const {
    selectedStep,
    originalSteps,
    modifiedSteps,
    nextStepId,
    previousStepId,
  } = props;

  const [conditionOpen, setConditionOpen] = useState(false);
  const [gotoStepId, setGotoStepId] = useState(nextStepId);

  const firstStep = selectedStep?.isFirstStep;

  const [initialFormValues, setInitialFormValues] = useState<
    ApprovalWorkflowStepInput
  >(
    selectedStep
      ? selectedStep
      : createNewStep(originalSteps, nextStepId, previousStepId)
  );

  useEffect(() => {
    if (selectedStep && selectedStep.stepId !== initialFormValues.stepId) {
      setInitialFormValues(selectedStep);
    } else if (
      !selectedStep &&
      !modifiedSteps.find(x => x.stepId === initialFormValues.stepId)
    ) {
      const newStep = createNewStep(originalSteps, nextStepId, previousStepId);
      setInitialFormValues(newStep);
      modifiedSteps.push(newStep);

      // If this is a new step being added as the default route of another step,
      // we need to update the source step's default transition
      const previousStepIndex = modifiedSteps.findIndex(
        x => x.stepId === previousStepId
      );
      if (previousStepIndex > -1) {
        modifiedSteps[previousStepIndex].onApproval[
          modifiedSteps[previousStepIndex].onApproval.length - 1
        ].goto = newStep.stepId;
      }
    }
  }, [
    initialFormValues,
    modifiedSteps,
    nextStepId,
    originalSteps,
    previousStepId,
    selectedStep,
  ]);

  // We need to only show Approver Groups in the select that haven't been used yet
  const approverGroupIdsToFilterOut = compact(
    modifiedSteps
      .filter(x => !x.deleted)
      .map(x => {
        if (
          initialFormValues.approverGroupHeaderId != x.approverGroupHeaderId
        ) {
          return x.approverGroupHeaderId;
        }
      })
  );

  const stepIndex = modifiedSteps.findIndex(
    x => x.stepId === initialFormValues.stepId
  );

  return conditionOpen ? (
    <ConditionPopper
      orgId={props.orgId}
      workflowType={props.workflowType}
      onClose={() => setConditionOpen(false)}
      steps={modifiedSteps}
      selectedStepId={initialFormValues.stepId}
      nextStepId={gotoStepId}
    />
  ) : (
    <div className={classes.popper}>
      <Section>
        {stepIndex > -1 && (
          <Formik
            enableReinitialize
            initialValues={initialFormValues}
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
              props.onSave(modifiedSteps);
              props.onClose();
            }}
          >
            {({ handleSubmit, submitForm, setFieldValue, values, errors }) => (
              <form onSubmit={handleSubmit}>
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
                        values.approverGroupHeaderId
                          ? [values.approverGroupHeaderId]
                          : undefined
                      }
                      setSelectedApproverGroupHeaderIds={(ids?: string[]) => {
                        if (ids && ids.length > 0) {
                          modifiedSteps[stepIndex].approverGroupHeaderId =
                            ids[0];
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
                  steps={modifiedSteps}
                  transitions={modifiedSteps[stepIndex].onApproval}
                  onUpdate={(onApproval: ApprovalWorkflowTransitionInput[]) => {
                    setFieldValue("onApproval", onApproval);
                    modifiedSteps[stepIndex].onApproval = onApproval;
                  }}
                  onEditTransition={(stepId?: string | null) => {
                    setGotoStepId(stepId);
                    setConditionOpen(true);
                  }}
                />
                <TextButton
                  onClick={() => {
                    setGotoStepId(undefined);
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
                    {selectedStep || firstStep ? t("Update") : t("Add")}
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
        )}
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
