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
} from "../../types";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave: (step: ApprovalWorkflowStepInput) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  selectedStep?: ApprovalWorkflowStepInput | null;
  previousStepId?: string;
  nextStepId?: string;
};

export const ConditionPopper: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { selectedStep, workflowType, steps, nextStepId } = props;

  const [step, setStep] = useState<ApprovalWorkflowStepInput>(
    selectedStep
      ? selectedStep
      : createNewStep(props.steps, props.nextStepId, props.previousStepId)
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
      props.workflowType
    )
  );

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
  const [transitionCriteria, setTransitionCriteria] = useState<
    AbsenceTransitionCriteria | VacancyTransitionCriteria | undefined
  >();

  const [reasonIds, setReasonIds] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (transition.goto) {
      const nextStep = steps.find(x => x.stepId === transition.goto);
      setApproverGroupId(nextStep?.approverGroupHeaderId ?? undefined);
    }
  }, [transition.goto, steps]);

  const onSetGroup = (ids?: string[]) => {
    if (ids && ids.length > 0) {
      setApproverGroupId(ids[0]);
      const step = steps.find(x => x.approverGroupHeaderId == ids[0]);
      transition.goto = step?.stepId;
    }
  };

  useEffect(() => {
    if (transition.criteria) {
      if (workflowType === ApprovalWorkflowType.Absence) {
        const criteria = transition.criteria as AbsenceTransitionCriteria;
        setTransitionCriteria(criteria);
        setReasonIds(compact(criteria.absenceReasonIds) ?? []);
      } else if (workflowType === ApprovalWorkflowType.Vacancy) {
        const criteria = transition.criteria as VacancyTransitionCriteria;
        setTransitionCriteria(criteria);
        setReasonIds(compact(criteria.vacancyReasonIds) ?? []);
      }
    }
  }, [transition, workflowType]);

  const handleSave = () => {
    const existingTransitionIndex = step.onApproval.findIndex(
      x => x.goto === transition.goto
    );
    const transitionInput = convertTransitionToInput(transition);
    if (existingTransitionIndex === -1) {
      step.onApproval.unshift(transitionInput);
      props.onSave(step);
    } else {
      step.onApproval[existingTransitionIndex] = transitionInput;
      props.onSave(step);
    }
  };

  const approverGroupIdsToInclude = compact(
    props.steps
      .filter(x => !x.deleted)
      .map(x => {
        if (step.approverGroupHeaderId != x.approverGroupHeaderId) {
          return x.approverGroupHeaderId;
        }
      })
  );

  return (
    <div className={classes.popper}>
      <Section>
        <div className={classes.labelText}>{t("When approved and...")}</div>
        <div className={classes.labelText}>{`${conditionLabel} ${t(
          "is"
        )}`}</div>
        <div className={classes.selectContainer}>
          {workflowType === ApprovalWorkflowType.Absence ? (
            <AbsenceReasonSelect
              orgId={props.orgId}
              includeAllOption={false}
              selectedAbsenceReasonIds={reasonIds}
              setSelectedAbsenceReasonIds={setReasonIds}
            />
          ) : workflowType === ApprovalWorkflowType.Vacancy ? (
            <VacancyReasonSelect
              orgId={props.orgId}
              includeAllOption={false}
              selectedVacancyReasonIds={reasonIds}
              setSelectedVacancyReasonIds={setReasonIds}
            />
          ) : (
            <></>
          )}
        </div>
        <div className={classes.labelText}>{t("Route to:")}</div>
        <div className={classes.selectContainer}>
          <ApproverGroupSelect
            orgId={props.orgId}
            multiple={false}
            selectedApproverGroupHeaderIds={
              approverGroupId ? [approverGroupId] : undefined
            }
            setSelectedApproverGroupHeaderIds={onSetGroup}
            idsToInclude={approverGroupIdsToInclude}
          />
        </div>
        <FormControlLabel
          control={
            <Checkbox
              checked={transition.args?.makeAvailableToFill ?? false}
              onChange={(e, checked) => {
                transition.args = { makeAvailableToFill: checked };
              }}
              value={transition.args?.makeAvailableToFill ?? false}
              color="primary"
            />
          }
          label={t("Release to be filled")}
        />
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            onClick={handleSave}
            className={classes.button}
          >
            {t("Save")}
          </Button>
          {selectedStep && (
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
}));
