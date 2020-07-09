import { makeStyles, Typography, TextField } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { VacancySummaryDetail, AssignmentFor } from "./types";
import { buildAssignmentGroups } from "./helpers";
import { AssignmentGroup } from "./assignment-group";
import { uniqWith } from "lodash-es";

type Props = {
  vacancySummaryDetails: VacancySummaryDetail[];
  showPayCodes: boolean;
  showAccountingCodes: boolean;
  showAbsenceTimes?: boolean;
  notesForSubstitute?: string;
  setNotesForSubstitute?: (notes: string) => void;
  onAssignClick?: (currentAssignmentInfo: AssignmentFor) => void;
  onCancelAssignment: (vacancyDetailIds: string[]) => Promise<void>;
  disableAssignmentActions?: boolean;
  detailsOnly?: boolean;
  divRef?: React.RefObject<HTMLDivElement>;
  readOnly?: boolean;
};

export const VacancySummary: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    vacancySummaryDetails,
    onAssignClick,
    onCancelAssignment,
    setNotesForSubstitute,
    showPayCodes,
    showAccountingCodes,
    notesForSubstitute = "",
    showAbsenceTimes = false,
    disableAssignmentActions = false,
    detailsOnly = false,
    divRef = null,
  } = props;

  const assignmentGroups = useMemo(() => {
    if (!vacancySummaryDetails || vacancySummaryDetails.length === 0) {
      return [];
    }

    const groups = buildAssignmentGroups(vacancySummaryDetails);
    return groups;
  }, [vacancySummaryDetails]);

  const isPartiallyFilled = useMemo(() => {
    if (!vacancySummaryDetails || vacancySummaryDetails.length === 0) {
      return false;
    }

    const uniqueRecords = uniqWith(
      vacancySummaryDetails,
      (a, b) =>
        a.assignment?.id === b.assignment?.id &&
        a.assignment?.employee?.id === b.assignment?.employee?.id
    );

    return (
      uniqueRecords.length > 1 ||
      !!uniqueRecords[0].assignment?.id ||
      !!uniqueRecords[0].assignment?.employee?.id
    );
  }, [vacancySummaryDetails]);

  return (
    <div className={classes.container} ref={divRef}>
      <div className={classes.header}>
        {showAbsenceTimes && (
          <div className={classes.headerItem}>{t("Absence")}</div>
        )}
        <div className={classes.headerItem}>{t("Substitute schedule")}</div>
      </div>
      {assignmentGroups.length === 0 && (
        <div className={classes.noDaysChosenContainer}>
          <Typography>{t("No days chosen")}</Typography>
        </div>
      )}
      <div className={classes.assignmentGroupsContainer}>
        {assignmentGroups.map((a, i) => (
          <AssignmentGroup
            key={i}
            assignmentWithDetails={a}
            isPartiallyFilled={isPartiallyFilled}
            showAbsenceTimes={showAbsenceTimes}
            onAssignClick={onAssignClick}
            onCancelAssignment={onCancelAssignment}
            disableActions={disableAssignmentActions}
            detailsOnly={detailsOnly}
            showPayCodes={showPayCodes}
            showAccountingCodes={showAccountingCodes}
            readOnly={props.readOnly ?? false}
          />
        ))}
      </div>
      {!detailsOnly && (
        <div className={classes.notesContainer}>
          <Typography variant={"h6"}>{t("Notes to substitute")}</Typography>
          <Typography variant="caption" className={classes.subText}>
            {t("Can be seen by the substititue, administrator and employee")}
          </Typography>
          <div className={classes.notesInput}>
            {setNotesForSubstitute ? (
              <TextField
                multiline={true}
                value={notesForSubstitute}
                fullWidth={true}
                placeholder={t("Enter notes for substitute")}
                variant="outlined"
                onChange={e => setNotesForSubstitute(e.target.value)}
              />
            ) : (
              <Typography>{notesForSubstitute}</Typography>
            )}
          </div>
        </div>
      )}
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
  headerItem: {
    flexGrow: 1,
  },
  noDaysChosenContainer: {
    marginTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  assignmentGroupsContainer: {},
  notesContainer: {
    marginTop: theme.spacing(2),
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
