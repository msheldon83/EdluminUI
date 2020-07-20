import * as React from "react";
import { makeStyles, Checkbox, IconButton, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
  ApprovalWorkflowTransitionInput,
} from "graphql/server-types.gen";
import {
  convertTransitionsFromInput,
  convertTransitionsToInput,
  AbsenceTransitionCriteria,
  VacancyTransitionCriteria,
} from "../../../types";
import { Cancel } from "@material-ui/icons";
import { TextButton } from "ui/components/text-button";

type Props = {
  workflowType: ApprovalWorkflowType;
  approverGroups: { id: string; name: string }[];
  reasons: {
    id: string;
    name: string;
  }[];
  steps: ApprovalWorkflowStepInput[];
  newSteps: ApprovalWorkflowStepInput[];
  transitions: ApprovalWorkflowTransitionInput[];
  onUpdate: (onApproval: ApprovalWorkflowTransitionInput[]) => void;
  onEditTransition: (nextStepId?: string | null) => void;
};

type AbsVacTransition = {
  goto?: string | null;
  args?: { makeAvailableToFill: boolean };
  criteria?: any;
};

export const AbsVacTransitions: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { transitions } = props;

  const parsedTransitions = convertTransitionsFromInput(
    transitions,
    props.workflowType
  ) as AbsVacTransition[];

  const allSteps = props.steps.concat(props.newSteps);

  const findApproverGroupName = (stepId?: string | null) => {
    const nextStep = allSteps.find(s => s.stepId === stepId);
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
      {parsedTransitions.map((tr, i) => {
        return (
          <Grid container spacing={1} key={i} className={classes.rowContainer}>
            <Grid item xs={9}>
              <TextButton
                onClick={() => props.onEditTransition(tr.goto)}
                className={classes.route}
              >
                {findApproverGroupName(tr.goto)}
              </TextButton>
              <div className={classes.argsText}>
                {renderCondition(tr.criteria)}
              </div>
            </Grid>
            <Grid item xs={2}>
              <Checkbox
                checked={tr.args?.makeAvailableToFill ?? false}
                onChange={() => {
                  parsedTransitions[i].args = {
                    makeAvailableToFill: !tr.args?.makeAvailableToFill,
                  };
                  props.onUpdate(convertTransitionsToInput(parsedTransitions));
                }}
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
                  onClick={() => {
                    if (parsedTransitions[i].criteria) {
                      parsedTransitions.splice(i, 1);
                      props.onUpdate(
                        convertTransitionsToInput(parsedTransitions)
                      );
                    }
                  }}
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
  route: {
    color: "#050039",
    textDecorationLine: "underline",
  },
}));
