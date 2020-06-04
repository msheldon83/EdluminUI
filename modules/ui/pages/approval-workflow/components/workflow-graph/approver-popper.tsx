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
} from "../../types";
import { ApprovalWorkflowStepInput } from "graphql/server-types.gen";
import { compact } from "lodash-es";

type Props = {
  orgId: string;
  onClose: () => void;
  onSave: (approverGroupId: string, args?: string, criteria?: string) => void;
  onRemove?: () => void;
  steps: ApprovalWorkflowStepInput[];
  myStep?: ApprovalWorkflowStepInput | null;
  defaultGotoStepId: string;
  approverGroups: { id: string; name: string }[];
};

export const AddUpdateApprover: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [approverGroupIds, setApproverGroupIds] = useState<
    string[] | undefined
  >(undefined);
  const [transitionArgs, setTransitionArgs] = useState<
    AbsenceTransitionArgs | undefined
  >(); // TODO: make this use either type

  const myStep = props.myStep;

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

  const handleSave = () => {
    if (approverGroupIds && approverGroupIds.length === 1) {
      props.onSave(
        approverGroupIds[0],
        buildTransitionArgsJsonString(transitionArgs)
      );
    }
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
    return criteria ? "" : `(${t("Default")})`;
  };

  return (
    <Section>
      <div className={classes.labelText}>
        {myStep ? t("Update approver group") : t("Add approver")}
      </div>
      <div className={classes.selectContainer}>
        <ApproverGroupSelect
          orgId={props.orgId}
          multiple={false}
          selectedApproverGroupHeaderIds={approverGroupIds}
          setSelectedApproverGroupHeaderIds={onSetGroup}
          idsToFilterOut={approverGroupIdsToFilterOut}
        />
      </div>
      <div className={classes.labelText}>{t("When approved")}</div>
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
          {myStep ? t("Update") : t("Add")}
        </Button>
        {props.onRemove && (
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
  },
}));