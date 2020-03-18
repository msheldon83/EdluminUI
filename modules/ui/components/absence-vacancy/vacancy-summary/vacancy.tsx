import { makeStyles, Typography, TextField } from "@material-ui/core";
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
  setNotesForSubstitute: (notes: string) => void;
  onAssignClick: (currentAssignmentInfo: AssignmentFor) => Promise<void>;
  onCancelAssignment: (
    assignmentInfo: Assignment,
    vacancyDetailIds: string[]
  ) => Promise<void>;
  disableAssignmentActions?: boolean;
};

export const Vacancy: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    vacancySummaryDetails,
    onAssignClick,
    onCancelAssignment,
    setNotesForSubstitute,
    notesForSubstitute = "",
    showAbsenceTimes = false,
    disableAssignmentActions = false,
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
      <div className={classes.assignmentGroupsContainer}>
        {assignmentGroups.map((a, i) => (
          <AssignmentGroup
            key={i}
            assignmentWithDetails={a}
            isPartiallyFilled={isPartiallyFilled}
            showAbsenceTimes={showAbsenceTimes}
            onAssignClick={onAssignClick}
            onCancelAssignment={onCancelAssignment}
          />
        ))}
      </div>
      {/* Notes for Sub, pre-arrange, assign, and edit sub details buttons all go here */}
      <div className={classes.notesContainer}>
        <Typography variant={"h6"}>{t("Notes for substitute")}</Typography>
        <Typography variant="caption" className={classes.subText}>
          {t("Can be seen by the substititue, administrator and employee")}
        </Typography>
        <div className={classes.notesInput}>
          <TextField
            multiline={true}
            value={notesForSubstitute}
            fullWidth={true}
            placeholder={t("Enter notes for substitute")}
            variant="outlined"
            onChange={() => setNotesForSubstitute("")}
          />
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingBottom: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: theme.customColors.lightGray,
    color: theme.customColors.edluminSubText,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  assignmentGroupsContainer: {
    marginBottom: theme.spacing(2),
  },
  notesContainer: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  notesInput: {
    marginTop: theme.spacing(),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
}));
