import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";
import { TextButton } from "ui/components/text-button";

type Props = {
  open: boolean;
  orgId: string;
  workflowType: ApprovalWorkflowType;
  reasonId?: string;
  setReasonId: (reasonId?: string) => void;
  onClose: () => void;
};

export const TestHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleSetReasonId = (reasonIds?: string[]) => {
    if (reasonIds && reasonIds.length > 0) {
      props.setReasonId(reasonIds[0]);
    } else {
      props.setReasonId(undefined);
    }
  };

  return props.open ? (
    <div className={classes.container}>
      {props.workflowType === ApprovalWorkflowType.Absence ? (
        <AbsenceReasonSelect
          label={t("Absence Reason")}
          orgId={props.orgId}
          includeAllOption={false}
          selectedAbsenceReasonIds={
            props.reasonId ? [props.reasonId] : undefined
          }
          setSelectedAbsenceReasonIds={handleSetReasonId}
          multiple={false}
        />
      ) : props.workflowType === ApprovalWorkflowType.Vacancy ? (
        <VacancyReasonSelect
          label={t("Vacancy Reason")}
          orgId={props.orgId}
          includeAllOption={false}
          selectedVacancyReasonIds={
            props.reasonId ? [props.reasonId] : undefined
          }
          setSelectedVacancyReasonIds={handleSetReasonId}
          multiple={false}
        />
      ) : (
        <></>
      )}
      <TextButton className={classes.hideButton} onClick={props.onClose}>
        {t("Hide")}
      </TextButton>
    </div>
  ) : (
    <></>
  );
};

const useStyles = makeStyles(theme => ({
  hideButton: {
    color: "#FF5555",
  },
  container: {
    display: "flex",
    paddingTop: theme.spacing(2),
  },
}));
