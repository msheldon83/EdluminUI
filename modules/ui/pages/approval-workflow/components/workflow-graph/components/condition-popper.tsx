import * as React from "react";
import { useState, useEffect } from "react";
import {
  makeStyles,
  Button,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ApproverGroupSelect } from "ui/components/domain-selects/approver-group-select/approver-group-select";
import { Section } from "ui/components/section";
import {
  AbsenceTransitionCriteria,
  VacancyTransitionCriteria,
  convertTransitionFromInput,
  convertTransitionToInput,
  createNewStep,
  AbsenceTransition,
  VacancyTransition,
  determinePathThroughAbsVacWorkflow,
} from "../types";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";
import { Formik } from "formik";
import * as Yup from "yup";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave: (steps: ApprovalWorkflowStepInput[]) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  selectedStep?: ApprovalWorkflowStepInput | null;
  nextStepId?: string | null;
  newSteps?: ApprovalWorkflowStepInput[];
};

export const ConditionPopper: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { selectedStep, workflowType, steps, nextStepId } = props;

  const [step, setStep] = useState<ApprovalWorkflowStepInput>(
    selectedStep ?? createNewStep(steps)
  );

  const [transition, setTransition] = useState<
    AbsenceTransition | VacancyTransition
  >(
    convertTransitionFromInput(
      step.onApproval.find(x => x.goto == nextStepId) ?? {
        goto: nextStepId,
        criteria: null,
        args: null,
      },
      workflowType
    )
  );

  const defaultTransition = step.onApproval[step.onApproval.length - 1];
  const transitionIsDefault = defaultTransition.goto === transition.goto;
  const transitionIndex = step.onApproval.findIndex(x => x.goto === nextStepId);

  useEffect(() => {
    if (selectedStep && selectedStep.stepId !== step.stepId) {
      setStep(selectedStep);
      setTransition(
        convertTransitionFromInput(
          step.onApproval.find(x => x.goto == nextStepId) ?? {
            goto: nextStepId,
            criteria: null,
            args: null,
          },
          workflowType
        )
      );
    }
  }, [nextStepId, selectedStep, step.onApproval, step.stepId, workflowType]);

  const conditionLabel =
    workflowType === ApprovalWorkflowType.Absence
      ? t("Absence Reason")
      : workflowType === ApprovalWorkflowType.Vacancy
      ? t("Vacancy Reason")
      : t("Condition");

  const [approverGroupId, setApproverGroupId] = useState<string | undefined>(
    undefined
  );

  const [reasonIds, setReasonIds] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (transition.goto) {
      const nextStep = steps.find(x => x.stepId === transition.goto);
      if (nextStep?.isLastStep) {
        setApproverGroupId("0"); // This will resolve to (Approved) in the dropdown
      } else {
        setApproverGroupId(nextStep?.approverGroupHeaderId ?? undefined);
      }
    }
  }, [transition.goto, steps]);

  useEffect(() => {
    if (transition.criteria) {
      if (workflowType === ApprovalWorkflowType.Absence) {
        const criteria = transition.criteria as AbsenceTransitionCriteria;
        setReasonIds(compact(criteria.absenceReasonIds) ?? []);
      } else if (workflowType === ApprovalWorkflowType.Vacancy) {
        const criteria = transition.criteria as VacancyTransitionCriteria;
        setReasonIds(compact(criteria.vacancyReasonIds) ?? []);
      }
    }
  }, [transition, workflowType]);

  // We need to filter out approver groups that have been used previously in the path so we don't create loops
  const determineApproverGroupIdsToFilterOut = (reasonIds?: string[]) => {
    const path = determinePathThroughAbsVacWorkflow(
      steps,
      workflowType,
      reasonIds,
      step.stepId
    );
    const ids = compact(path.map(x => x.approverGroupHeaderId));
    if (step.approverGroupHeaderId) {
      ids.push(step.approverGroupHeaderId);
    }
    return ids;
  };

  return (
    <div className={classes.popper}>
      <Section>
        <Formik
          enableReinitialize
          initialValues={{
            approverGroupHeaderId: approverGroupId,
            args: { makeAvailableToFill: transition.args?.makeAvailableToFill },
            reasonIds: reasonIds,
          }}
          validationSchema={Yup.object().shape({
            approverGroupHeaderId: Yup.string()
              .nullable()
              .required(t("An approver group is required")),
            reasonIds: Yup.array(Yup.string())
              .nullable()
              .required(t("A reason is required")),
          })}
          onSubmit={data => {
            let nextGoto = steps.find(x => {
              if (data.approverGroupHeaderId === "0") {
                return x.isLastStep;
              } else {
                return x.approverGroupHeaderId == data.approverGroupHeaderId;
              }
            })?.stepId;

            let newStep = undefined as ApprovalWorkflowStepInput | undefined;
            if (nextGoto === undefined) {
              newStep = createNewStep(
                steps,
                step.onApproval.find(x => !x.criteria)?.goto,
                step.stepId,
                data.approverGroupHeaderId,
                props.newSteps
              );
              nextGoto = newStep.stepId;
            }
            const newTransition =
              workflowType === ApprovalWorkflowType.Absence
                ? ({
                    goto: nextGoto,
                    args: data.args,
                    criteria: reasonIds
                      ? { absenceReasonIds: reasonIds }
                      : null,
                  } as AbsenceTransition)
                : ({
                    goto: nextGoto,
                    args: data.args,
                    criteria: reasonIds
                      ? { vacancyReasonIds: reasonIds }
                      : null,
                  } as VacancyTransition);
            const transitionInput = convertTransitionToInput(newTransition);
            if (transitionIndex === -1) {
              step.onApproval.unshift(transitionInput);
            } else {
              step.onApproval[transitionIndex] = transitionInput;
            }
            newStep ? props.onSave([newStep, step]) : props.onSave([step]);
            props.onClose();
          }}
        >
          {({ handleSubmit, submitForm, setFieldValue, values, errors }) => (
            <form onSubmit={handleSubmit}>
              <div className={classes.labelText}>
                {t("When approved and...")}
              </div>
              {transitionIsDefault ? (
                <div className={classes.subLabelText}>
                  {t("No other conditions are met ")}
                  <span className={classes.defaultText}>
                    {t("(default transition)")}
                  </span>
                </div>
              ) : (
                <>
                  <div className={classes.labelText}>{`${conditionLabel} ${t(
                    "is"
                  )}`}</div>
                  <div className={classes.selectContainer}>
                    {workflowType === ApprovalWorkflowType.Absence ? (
                      <AbsenceReasonSelect
                        orgId={props.orgId}
                        includeAllOption={false}
                        selectedAbsenceReasonIds={values.reasonIds}
                        setSelectedAbsenceReasonIds={setReasonIds}
                        errorMessage={errors.reasonIds}
                      />
                    ) : workflowType === ApprovalWorkflowType.Vacancy ? (
                      <VacancyReasonSelect
                        orgId={props.orgId}
                        includeAllOption={false}
                        selectedVacancyReasonIds={values.reasonIds}
                        setSelectedVacancyReasonIds={setReasonIds}
                        errorMessage={errors.reasonIds}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              )}
              <div className={classes.labelText}>{t("Route to:")}</div>
              <div className={classes.selectContainer}>
                <ApproverGroupSelect
                  orgId={props.orgId}
                  multiple={false}
                  selectedApproverGroupHeaderIds={
                    values.approverGroupHeaderId
                      ? [values.approverGroupHeaderId]
                      : ["0"]
                  }
                  setSelectedApproverGroupHeaderIds={(ids?: string[]) => {
                    if (ids && ids.length > 0) {
                      setFieldValue("approverGroupHeaderId", ids[0]);
                    } else {
                      setFieldValue("approverGroupHeaderId", null);
                    }
                  }}
                  idsToFilterOut={determineApproverGroupIdsToFilterOut(
                    values.reasonIds
                  )}
                  addApprovedOption={true}
                  errorMessage={errors.approverGroupHeaderId}
                />
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.args?.makeAvailableToFill ?? false}
                    onChange={(e, checked) =>
                      setFieldValue("args", {
                        makeAvailableToFill: !values.args?.makeAvailableToFill,
                      })
                    }
                    value={values.args?.makeAvailableToFill ?? false}
                    color="primary"
                  />
                }
                label={t("Release to be filled")}
              />
              <div className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  onClick={submitForm}
                  className={classes.button}
                >
                  {nextStepId ? t("Update") : t("Add")}
                </Button>
                {nextStepId && (
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
                  {t("Cancel")}
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
    flex: 2,
    paddingLeft: theme.spacing(2),
  },
  popper: {
    width: "350px",
  },
  defaultText: {
    fontSize: theme.typography.pxToRem(12),
    color: "#9E9E9E",
    fontWeight: "normal",
  },
  subLabelText: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
  },
}));
