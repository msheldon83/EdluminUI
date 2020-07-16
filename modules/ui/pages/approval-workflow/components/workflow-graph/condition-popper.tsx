import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ApproverGroupSelect } from "ui/components/domain-selects/approver-group-select/approver-group-select";
import { Section } from "ui/components/section";
import {
  AbsenceTransitionCriteria,
  VacancyTransitionCriteria,
  buildTransitionCriteriaJsonString,
} from "../../types";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
  ApprovalWorkflowTransitionInput,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave: (stepId: string, transition: ApprovalWorkflowTransitionInput) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  myStep: ApprovalWorkflowStepInput;
  gotoStepId?: string | null;
};

export const ConditionPopper: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { myStep, workflowType, steps, gotoStepId } = props;

  const conditionLabel =
    workflowType === ApprovalWorkflowType.Absence
      ? t("Absence Reason")
      : workflowType === ApprovalWorkflowType.Vacancy
      ? t("Vacancy Reason")
      : t("Condition");

  const [approverGroupIds, setApproverGroupIds] = useState<
    string[] | undefined
  >(undefined);
  const [transitionCriteria, setTransitionCriteria] = useState<
    AbsenceTransitionCriteria | VacancyTransitionCriteria | undefined
  >();

  const [reasonIds, setReasonIds] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (gotoStepId) {
      const nextStep = steps.find(x => x.stepId === gotoStepId);
      setApproverGroupIds(
        nextStep?.approverGroupHeaderId
          ? [nextStep.approverGroupHeaderId]
          : undefined
      );
    }
  }, [gotoStepId, steps]);

  const onSetGroup = (ids?: string[]) => {
    setApproverGroupIds(ids);
  };

  useEffect(() => {
    if (gotoStepId && myStep) {
      const criteria = myStep.onApproval.find(x => x.goto === gotoStepId)
        ?.criteria;
      if (criteria) {
        if (workflowType === ApprovalWorkflowType.Absence) {
          const parsedCriteria: AbsenceTransitionCriteria = JSON.parse(
            criteria
          );
          setTransitionCriteria(parsedCriteria);
          setReasonIds(compact(parsedCriteria.absenceReasonIds) ?? []);
        }
        if (workflowType === ApprovalWorkflowType.Vacancy) {
          const parsedCriteria: VacancyTransitionCriteria = JSON.parse(
            criteria
          );
          setTransitionCriteria(parsedCriteria);
          setReasonIds(compact(parsedCriteria.vacancyReasonIds) ?? []);
        }
      }
    }
  }, [gotoStepId, myStep, workflowType]);

  const handleSave = () => {
    props.onSave(myStep.stepId, {
      buildTransitionCriteriaJsonString(transitionCriteria);,
    });
  };

  const approverGroupIdsToInclude = compact(
    props.steps
      .filter(x => !x.deleted)
      .map(x => {
        if (
          !myStep ||
          (myStep && myStep.approverGroupHeaderId != x.approverGroupHeaderId)
        ) {
          return x.approverGroupHeaderId;
        }
      })
  );

  return (
    <div className={classes.popper}>
      <Section>
        <div className={classes.labelText}>{t("Route if")}</div>
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
            selectedApproverGroupHeaderIds={approverGroupIds}
            setSelectedApproverGroupHeaderIds={onSetGroup}
            idsToInclude={approverGroupIdsToInclude}
          />
        </div>
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            onClick={handleSave}
            className={classes.button}
          >
            {t("Save")}
          </Button>
          {gotoStepId && myStep && (
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
