import * as React from "react";
import { useState, useEffect, useMemo } from "react";
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
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useVacancyReasons } from "reference-data/vacancy-reasons";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave?: (steps: ApprovalWorkflowStepInput[]) => void;
  steps: ApprovalWorkflowStepInput[];
  selectedStepId: string;
  nextStepId?: string | null;
};

type ConditionValues = {
  approverGroupHeaderId?: string;
  args?: { makeAvailableToFill?: boolean };
  reasonIds?: string[];
  transitionIsDefault?: boolean;
};

export const ConditionPopper: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { selectedStepId, workflowType, steps, nextStepId } = props;

  const [initialFormData, setInitialFormData] = useState<ConditionValues>({});

  const stepIndex = steps.findIndex(x => x.stepId === selectedStepId);
  const transitionIndex = steps[stepIndex]?.onApproval.findIndex(
    x => x.goto === nextStepId
  );
  const transitionIsDefault =
    steps[stepIndex]?.onApproval[steps[stepIndex]?.onApproval.length - 1]
      ?.goto === steps[stepIndex]?.onApproval[transitionIndex]?.goto;

  useEffect(() => {
    const initialValues: ConditionValues = { transitionIsDefault };

    if (transitionIndex > -1 && stepIndex > -1) {
      const transition = convertTransitionFromInput(
        steps[stepIndex].onApproval[transitionIndex],
        workflowType
      );

      if (transition.goto) {
        const nextStep = steps.find(x => x.stepId === transition.goto);
        if (nextStep?.isLastStep) {
          initialValues.approverGroupHeaderId = "0"; // This will resolve to (Approved) in the dropdown
        } else {
          initialValues.approverGroupHeaderId =
            nextStep?.approverGroupHeaderId ?? undefined;
        }
      }

      if (transition.criteria) {
        if (workflowType === ApprovalWorkflowType.Absence) {
          const criteria = transition.criteria as AbsenceTransitionCriteria;
          initialValues.reasonIds = compact(criteria.absenceReasonIds) ?? [];
        } else if (workflowType === ApprovalWorkflowType.Vacancy) {
          const criteria = transition.criteria as VacancyTransitionCriteria;
          initialValues.reasonIds = compact(criteria.vacancyReasonIds) ?? [];
        }
      }

      if (transition.args) {
        initialValues.args = transition.args;
      }
    }
    setInitialFormData(initialValues);
  }, [stepIndex, steps, transitionIndex, workflowType, selectedStepId]);

  const conditionLabel =
    workflowType === ApprovalWorkflowType.Absence
      ? t("Absence Reason")
      : workflowType === ApprovalWorkflowType.Vacancy
      ? t("Vacancy Reason")
      : t("Condition");

  // We need to filter out approver groups that have been used previously in the path so we don't create loops
  const determineApproverGroupIdsToFilterOut = (reasonIds?: string[]) => {
    const path = determinePathThroughAbsVacWorkflow(
      steps,
      workflowType,
      reasonIds,
      selectedStepId
    );
    const ids = compact(path.map(x => x.approverGroupHeaderId));
    return ids;
  };

  const absenceReasons = useAbsenceReasons(props.orgId);
  const vacancyReasons = useVacancyReasons(props.orgId);

  // We want to include only reasons that would be able to get to this step
  const reasonIdsToInclude = useMemo(() => {
    const reasonIds: string[] = [];
    if (workflowType === ApprovalWorkflowType.Absence) {
      absenceReasons
        .filter(x => x.requiresApproval)
        .forEach(a => {
          const path = determinePathThroughAbsVacWorkflow(
            steps,
            workflowType,
            [a.id],
            selectedStepId
          );
          if (path.find(x => x.stepId === selectedStepId)) {
            reasonIds.push(a.id);
          }
        });
    } else {
      vacancyReasons
        .filter(x => x.requiresApproval)
        .forEach(v => {
          const path = determinePathThroughAbsVacWorkflow(
            steps,
            workflowType,
            [v.id],
            selectedStepId
          );
          if (path.find(x => x.stepId === selectedStepId)) {
            reasonIds.push(v.id);
          }
        });
    }

    return reasonIds.length > 0 ? reasonIds : undefined;
  }, [absenceReasons, steps, selectedStepId, vacancyReasons, workflowType]);

  const handleRemove = () => {
    steps[stepIndex].onApproval.splice(transitionIndex, 1);
    // Only the graph page supplies the onSave, so call it to remove the transition from the graph
    if (props.onSave) {
      props.onSave(steps);
    }
    props.onClose();
  };

  return (
    <div className={classes.popper}>
      <Section>
        {stepIndex > -1 && (
          <Formik
            enableReinitialize
            initialValues={initialFormData}
            validationSchema={Yup.object().shape({
              transitionIsDefault: Yup.boolean(),
              approverGroupHeaderId: Yup.string()
                .nullable()
                .required(t("An approver group is required")),
              reasonIds: Yup.array(Yup.string()).when("transitionIsDefault", {
                is: true,
                then: Yup.array(Yup.string()).nullable(),
                otherwise: Yup.array(Yup.string())
                  .nullable()
                  .required(t("A reason is required")),
              }),
            })}
            onSubmit={data => {
              let nextGoto = steps
                .filter(x => !x.deleted)
                .find(x => {
                  if (data.approverGroupHeaderId === "0") {
                    return x.isLastStep;
                  } else {
                    return (
                      x.approverGroupHeaderId == data.approverGroupHeaderId
                    );
                  }
                })?.stepId;

              let newStep = undefined as ApprovalWorkflowStepInput | undefined;
              if (nextGoto === undefined) {
                newStep = createNewStep(
                  steps,
                  steps[stepIndex].onApproval.find(x => !x.criteria)?.goto,
                  steps[stepIndex].stepId,
                  data.approverGroupHeaderId
                );
                nextGoto = newStep.stepId;
                steps.push(newStep);
              }
              const newTransition =
                workflowType === ApprovalWorkflowType.Absence
                  ? ({
                      goto: nextGoto,
                      args: data.args,
                      criteria: data.reasonIds
                        ? { absenceReasonIds: data.reasonIds }
                        : null,
                    } as AbsenceTransition)
                  : ({
                      goto: nextGoto,
                      args: data.args,
                      criteria: data.reasonIds
                        ? { vacancyReasonIds: data.reasonIds }
                        : null,
                    } as VacancyTransition);

              const transitionInput = convertTransitionToInput(newTransition);
              if (transitionIndex === -1) {
                steps[stepIndex].onApproval.unshift(transitionInput);
              } else {
                steps[stepIndex].onApproval[transitionIndex] = transitionInput;
              }

              // onSave is only provided from the Graph edit component when the user clicks the yellow if to edit a condition directly.
              // When getting here from the step edit dialog, we will be modifying the array directly and that dialog will handle updating the graph
              if (props.onSave) props.onSave(steps);
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
                          setSelectedAbsenceReasonIds={(ids?: string[]) =>
                            setFieldValue("reasonIds", ids)
                          }
                          errorMessage={errors.reasonIds}
                          idsToInclude={reasonIdsToInclude}
                        />
                      ) : workflowType === ApprovalWorkflowType.Vacancy ? (
                        <VacancyReasonSelect
                          orgId={props.orgId}
                          includeAllOption={false}
                          selectedVacancyReasonIds={values.reasonIds}
                          setSelectedVacancyReasonIds={(ids?: string[]) =>
                            setFieldValue("reasonIds", ids)
                          }
                          errorMessage={errors.reasonIds}
                          idsToInclude={reasonIdsToInclude}
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
                        : undefined
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
                          makeAvailableToFill: !values.args
                            ?.makeAvailableToFill,
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
                  {!transitionIsDefault && transitionIndex > -1 && (
                    <Button
                      variant="outlined"
                      onClick={handleRemove}
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
