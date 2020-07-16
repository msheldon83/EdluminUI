import * as React from "react";
import { makeStyles, Checkbox, IconButton, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import {
  convertTransitionsFromInput,
  AbsenceTransitionCriteria,
  VacancyTransitionCriteria,
} from "../../../types";
import { Cancel } from "@material-ui/icons";

type Props = {
  workflowType: ApprovalWorkflowType;
  approverGroups: { id: string; name: string }[];
  reasons: {
    id: string;
    name: string;
  }[];
  step: ApprovalWorkflowStepInput;
  steps: ApprovalWorkflowStepInput[];
  onChange: (step: ApprovalWorkflowStepInput) => void;
};

export const AbsVacTransitions: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { step } = props;

  const transitions = convertTransitionsFromInput(
    step.onApproval,
    props.workflowType
  ) as any[];

  const findApproverGroupName = (stepId?: string | null) => {
    const nextStep = props.steps.find(s => s.stepId === stepId);
    const approverGroupName = nextStep?.approverGroupHeaderId
      ? props.approverGroups.find(x => x.id === nextStep.approverGroupHeaderId)
          ?.name
      : t("Approved");
    return approverGroupName;
  };

  const renderCondition = (criteria?: any) => {
    if (!criteria) return t("(default)");

    if (props.workflowType === ApprovalWorkflowType.Absence) {
      const absenceCriteria: AbsenceTransitionCriteria = criteria;
      const reasonNames = props.reasons
        .filter(x => absenceCriteria.absenceReasonIds?.includes(x.id))
        .map(x => x.name)
        .join(", ");
      return `${t("if reason is")} ${reasonNames}`;
    }
    if (props.workflowType === ApprovalWorkflowType.Vacancy) {
      const vacancyCriteria: VacancyTransitionCriteria = criteria;
      const reasonNames = props.reasons
        .filter(x => vacancyCriteria.vacancyReasonIds?.includes(x.id))
        .map(x => x.name)
        .join(", ");
      return `${t("if reason is")} ${reasonNames}`;
    }
    return "";
  };

  const onUpdateAvailableToFill = (
    makeAvailableToFill: boolean,
    index: number
  ) => {
    step.onApproval[index].args = JSON.stringify({
      makeAvailableToFill: makeAvailableToFill,
    });
    props.onChange(step);
  };

  const onRemoveCriteria = (index: number) => {
    if (step.onApproval[index].criteria) {
      step.onApproval.splice(index, 1);
      props.onChange(step);
    }
  };

  return (
    <div className={classes.container}>
      <Grid container spacing={1}>
        <Grid item xs={9}>
          <div className={classes.routeToText}>{t("route to:")}</div>
        </Grid>
        <Grid item xs={2}>
          {t("Release")}
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
      {transitions.map((tr, i) => {
        return (
          <Grid container spacing={1} key={i} className={classes.rowContainer}>
            <Grid item xs={9}>
              <div>{findApproverGroupName(tr.goto)}</div>
              <div className={classes.argsText}>
                {renderCondition(tr.criteria)}
              </div>
            </Grid>
            <Grid item xs={2}>
              <Checkbox
                checked={tr.args?.makeAvailableToFill ?? false}
                onChange={(e, checked) => onUpdateAvailableToFill(checked, i)}
                value={tr.args?.makeAvailableToFill ?? false}
                color="primary"
              />
            </Grid>
            <Grid item xs={1}>
              {tr.criteria && (
                <IconButton
                  key="close"
                  aria-label="close"
                  color="inherit"
                  onClick={() => onRemoveCriteria(i)}
                >
                  <Cancel className={classes.cancelIcon} />
                </IconButton>
              )}
            </Grid>
          </Grid>
        );
      })}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
  },
  rowContainer: {
    paddingTop: theme.spacing(0.5),
  },
  routeToText: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(14),
  },
  cancelIcon: {
    color: "#FF5555",
    fontSize: theme.typography.pxToRem(20),
  },
  argsText: {
    fontSize: theme.typography.pxToRem(12),
    color: "#9E9E9E",
  },
}));
