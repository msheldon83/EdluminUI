import * as React from "react";
import { useState, useEffect } from "react";
import {
  makeStyles,
  Button,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ApproverGroupSelect } from "ui/components/domain-selects/approver-group-select/approver-group-select";
import { Section } from "ui/components/section";
import {
  AbsenceTransitionArgs,
  buildTransitionArgsJsonString,
  AbsenceTransitionCriteria,
  VacancyTransitionCriteria,
} from "../../types";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
  ApprovalWorkflowTransitionInput,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";

type Props = {
  orgId: string;
  workflowType: ApprovalWorkflowType;
  onClose: () => void;
  onSave: (
    onApproval: ApprovalWorkflowTransitionInput[],
    stepId?: string,
    groupId?: string
  ) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  myStep?: ApprovalWorkflowStepInput | null;
  defaultGotoStepId: string;
  approverGroups: { id: string; name: string }[];
  reasons: {
    id: string;
    name: string;
  }[];
};

export const AddUpdateApprover: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { myStep } = props;
  const firstStep = myStep?.isFirstStep;

  const [approverGroupIds, setApproverGroupIds] = useState<
    string[] | undefined
  >(undefined);
  const [transitionArgs, setTransitionArgs] = useState<
    AbsenceTransitionArgs | undefined
  >(); // TODO: make this use either type

  const [onApproval, setOnApproval] = useState<
    ApprovalWorkflowTransitionInput[]
  >(myStep ? myStep.onApproval : [{ goto: null, criteria: null, args: null }]);

  useEffect(() => {
    if (myStep && myStep.approverGroupHeaderId) {
      setApproverGroupIds([myStep.approverGroupHeaderId]);
    }
  }, [myStep]);

  const onSetGroup = (ids?: string[]) => {
    setApproverGroupIds(ids);
  };

  useEffect(() => {
    if (myStep) {
      const args: AbsenceTransitionArgs = JSON.parse(
        myStep.onApproval?.find(x => !x.criteria)?.args ?? "{}"
      );
      setTransitionArgs(args);
    }
  }, [myStep]);

  // TODO: Refactor the save so that this component is building the full step Input and passing it back to the parent
  const handleSave = () => {
    props.onSave(
      onApproval,
      myStep?.stepId,
      approverGroupIds ? approverGroupIds[0] : undefined
    );
  };

  const handleUpdateTransitionArgs = (args: AbsenceTransitionArgs) => {
    const argsJsonString = buildTransitionArgsJsonString(transitionArgs);
    onApproval.forEach(x => (x.args = argsJsonString));
    setTransitionArgs(args);
  };

  const myTransitions = myStep ? myStep.onApproval : null;

  const findApproverGroupName = (stepId?: string | null) => {
    const nextStep = props.steps.find(s => s.stepId === stepId);
    const approverGroupName = nextStep?.approverGroupHeaderId
      ? props.approverGroups.find(x => x.id === nextStep.approverGroupHeaderId)
          ?.name
      : t("Approved");
    return approverGroupName;
  };

  const approverGroupIdsToFilterOut = compact(
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

  const renderCondition = (criteria?: string | null) => {
    if (!criteria) return t("(Default)");

    if (props.workflowType === ApprovalWorkflowType.Absence) {
      const parsedCriteria: AbsenceTransitionCriteria = JSON.parse(criteria);
      const reasonNames = props.reasons
        .filter(x => parsedCriteria.absenceReasonIds?.includes(x.id))
        .map(x => x.name)
        .join(", ");
      return `${t("if Reason is")} ${reasonNames}`;
    }
    if (props.workflowType === ApprovalWorkflowType.Vacancy) {
      const parsedCriteria: VacancyTransitionCriteria = JSON.parse(criteria);
      const reasonNames = props.reasons
        .filter(x => parsedCriteria.vacancyReasonIds?.includes(x.id))
        .map(x => x.name)
        .join(", ");
      return `${t("if Reason is")} ${reasonNames}`;
    }
    return "";
  };

  return (
    <div className={classes.popper}>
      <Section>
        <div className={classes.labelText}>
          {firstStep
            ? t("Begin workflow")
            : myStep
            ? t("Update approver group")
            : t("Add approver")}
        </div>
        {!firstStep && (
          <div className={classes.selectContainer}>
            <ApproverGroupSelect
              orgId={props.orgId}
              multiple={false}
              selectedApproverGroupHeaderIds={approverGroupIds}
              setSelectedApproverGroupHeaderIds={onSetGroup}
              idsToFilterOut={approverGroupIdsToFilterOut}
            />
          </div>
        )}
        {!firstStep && (
          <div className={classes.labelText}>{t("When approved")}</div>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={transitionArgs?.makeAvailableToFill ?? false}
              onChange={e =>
                setTransitionArgs({
                  makeAvailableToFill: !transitionArgs?.makeAvailableToFill,
                })
              }
              value={transitionArgs?.makeAvailableToFill ?? false}
              color="primary"
            />
          }
          label={t("Release to be filled")}
        />
        <div className={classes.labelText}>{t("Route to:")}</div>
        {myTransitions ? (
          myTransitions.map((t, i) => (
            <div key={i} className={classes.gotoNameContainer}>
              <div className={classes.gotoName}>
                {findApproverGroupName(t.goto)}
              </div>
              <div className={classes.gotoCondition}>
                {renderCondition(t.criteria)}
              </div>
            </div>
          ))
        ) : (
          <div className={classes.gotoNameContainer}>
            <div className={classes.gotoName}>
              {findApproverGroupName(props.defaultGotoStepId)}
            </div>
            <div className={classes.gotoCondition}>{renderCondition()}</div>
          </div>
        )}
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            onClick={handleSave}
            className={classes.button}
          >
            {myStep || firstStep ? t("Update") : t("Add")}
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
