import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { VacancySummaryDetail, AssignmentFor } from "./types";
import { buildAssignmentGroups } from "./helpers";
import { AssignmentGroup } from "./assignment-group";
import { uniqBy } from "lodash-es";

type Props = {
  vacancySummaryDetails: VacancySummaryDetail[];
  showAbsenceTimes?: boolean;
  notesForSubstitute?: string;
  setNotesForSubstitute: () => void;
  onAssignClick: (currentAssignmentInfo: AssignmentFor) => Promise<void>;
  onRemoveClick: (currentAssignmentInfo: AssignmentFor) => Promise<void>;
};

export const Vacancy: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    vacancySummaryDetails,
    onAssignClick,
    onRemoveClick,
    setNotesForSubstitute,
    notesForSubstitute = "",
    showAbsenceTimes = false,
  } = props;

  const assignmentGroups = useMemo(() => {
    return buildAssignmentGroups(vacancySummaryDetails);
  }, [vacancySummaryDetails]);

  const isPartiallyFilled = useMemo(() => {
    const uniqueRecords = uniqBy(vacancySummaryDetails, "assignment");
    return uniqueRecords.length > 1 || !!uniqueRecords[0].assignment?.id;
  }, [vacancySummaryDetails]);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {showAbsenceTimes && <div>{t("Absence")}</div>}
        <div>{t("Substitute schedule")}</div>
      </div>
      <div>
        {assignmentGroups.map((a, i) => (
          <AssignmentGroup
            key={i}
            assignmentWithDetails={a}
            isPartiallyFilled={isPartiallyFilled}
            showAbsenceTimes={showAbsenceTimes}
            onAssignClick={onAssignClick}
            onRemoveClick={onRemoveClick}
          />
        ))}
      </div>
      {/* Notes for Sub, pre-arrange, assign, and edit sub details buttons all go here */}
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
  },
  header: {},
}));
