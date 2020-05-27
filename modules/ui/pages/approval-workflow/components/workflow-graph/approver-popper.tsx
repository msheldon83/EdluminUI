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

type Props = {
  orgId: string;
  onClose: () => void;
  onSave: (approverGroupId: string, args?: string, criteria?: string) => void;
  onRemove?: () => void;
  selectedGroupId?: string;
  transitionArgs?: string | null;
  transitionCriteria?: string | null;
  idsToFilterOut?: string[];
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

  useEffect(() => {
    if (props.selectedGroupId) {
      setApproverGroupIds([props.selectedGroupId]);
    }
  }, [props.selectedGroupId]);

  const onSetGroup = (ids?: string[]) => {
    setApproverGroupIds(ids);
  };

  const handleSave = () => {
    if (approverGroupIds && approverGroupIds.length === 1) {
      props.onSave(
        approverGroupIds[0],
        buildTransitionArgsJsonString(transitionArgs)
      );
    }
  };

  return (
    <Section>
      <div className={classes.labelText}>
        {props.selectedGroupId ? t("Update approver group") : t("Add approver")}
      </div>
      <ApproverGroupSelect
        orgId={props.orgId}
        multiple={false}
        selectedApproverGroupHeaderIds={approverGroupIds}
        setSelectedApproverGroupHeaderIds={onSetGroup}
        idsToFilterOut={props.idsToFilterOut}
      />
      <div className={classes.labelText}>{t("When approved")}</div>
      <FormControlLabel
        control={
          <Checkbox
            checked={transitionArgs?.makeAvailableToFill}
            onChange={e =>
              setTransitionArgs({
                makeAvailableToFill: !transitionArgs?.makeAvailableToFill,
              })
            }
            value={transitionArgs?.makeAvailableToFill}
            color="primary"
          />
        }
        label={t("Release to be filled")}
      />
      <div className={classes.labelText}>{t("Route to:")}</div>

      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          onClick={handleSave}
          className={classes.button}
        >
          {t("Save")}
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
    paddingBottom: theme.spacing(1),
  },
  buttonContainer: {
    display: "flex",
    paddingTop: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(2),
  },
}));
