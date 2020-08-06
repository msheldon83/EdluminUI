import { makeStyles, Typography, TextField, Grid } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { VacancySummaryDetail, AssignmentFor } from "./types";
import { buildAssignmentGroups } from "./helpers";
import { AssignmentGroup } from "./assignment-group";
import { uniqWith } from "lodash-es";
import { secondsSinceMidnight } from "helpers/time";
import { FilteredAssignmentButton } from "../filtered-assignment-button";
import { AssignmentDialog } from "./assignment-dialog";
import { useIsCurrentlyMounted } from "hooks/use-is-currently-mounted";

type Props = {
  vacancySummaryDetails: VacancySummaryDetail[];
  showPayCodes: boolean;
  showAccountingCodes: boolean;
  notesForSubstitute?: string;
  setNotesForSubstitute?: (notes: string) => void;
  onAssignClick?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<void>;
  onCancelAssignment?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<boolean>;
  disableAssignmentActions?: boolean;
  detailsOnly?: boolean;
  divRef?: React.RefObject<HTMLDivElement>;
  readOnly?: boolean;
  noDaysChosenText?: string;
  showAssignAllButton?: boolean;
  isAbsence?: boolean;
  absenceActions?: JSX.Element;
  footerActions?: JSX.Element;
  allowRemoval?: boolean;
};

export const VacancySummary: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isCurrentlyMounted = useIsCurrentlyMounted();
  const {
    vacancySummaryDetails,
    onAssignClick,
    onCancelAssignment,
    setNotesForSubstitute,
    showPayCodes,
    showAccountingCodes,
    notesForSubstitute = "",
    showAssignAllButton = false,
    isAbsence = false,
    disableAssignmentActions = false,
    detailsOnly = false,
    divRef = null,
    absenceActions = null,
    footerActions = null,
    noDaysChosenText = t("No days chosen"),
    allowRemoval = false,
  } = props;

  const assignmentGroups = useMemo(() => {
    if (!vacancySummaryDetails || vacancySummaryDetails.length === 0) {
      return [];
    }

    const groups = buildAssignmentGroups(
      vacancySummaryDetails,
      !showAccountingCodes,
      !showPayCodes
    );
    return groups;
  }, [showAccountingCodes, showPayCodes, vacancySummaryDetails]);

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

  const isExistingVacancy = useMemo(() => {
    if (vacancySummaryDetails.length === 0) {
      return false;
    }

    return !!vacancySummaryDetails[0]?.vacancyId;
  }, [vacancySummaryDetails]);

  const [assignmentDialogIsOpen, setAssignmentDialogIsOpen] = React.useState<
    boolean
  >(false);
  const onLocalAssignClick = React.useCallback(async () => {
    if (!onAssignClick) {
      return;
    }

    if (vacancySummaryDetails.length === 1) {
      // Assigning or prearranging for a single vacancy detail, no need to prompt the user
      await onAssignClick(vacancySummaryDetails);
    } else {
      // Assigning or prearranging for multiple vacancy details, want to ask the user what they want to do
      setAssignmentDialogIsOpen(true);
    }
  }, [onAssignClick, vacancySummaryDetails]);

  return (
    <>
      {onAssignClick && (
        <AssignmentDialog
          action={isExistingVacancy ? "assign" : "pre-arrange"}
          onSubmit={onAssignClick}
          onClose={() => isCurrentlyMounted && setAssignmentDialogIsOpen(false)}
          open={assignmentDialogIsOpen}
          vacancySummaryDetails={vacancySummaryDetails}
        />
      )}
      <div className={classes.container} ref={divRef}>
        <Grid container className={classes.header}>
          {isAbsence && (
            <Grid item xs={4}>
              {t("Absence")}
            </Grid>
          )}
          <Grid item xs={isAbsence ? 8 : 12}>
            {t("Substitute schedule")}
          </Grid>
        </Grid>
        {assignmentGroups.length === 0 && (
          <div className={classes.noDaysChosenContainer}>
            <Typography>{noDaysChosenText}</Typography>
          </div>
        )}
        <div className={classes.assignmentGroupsContainer}>
          {assignmentGroups.map((a, i) => (
            <AssignmentGroup
              key={i}
              assignmentWithDetails={a}
              isPartiallyFilled={isPartiallyFilled}
              showAbsenceTimes={isAbsence}
              onAssignClick={onAssignClick}
              onCancelAssignment={onCancelAssignment}
              disableActions={disableAssignmentActions}
              detailsOnly={detailsOnly}
              showPayCodes={showPayCodes}
              showAccountingCodes={showAccountingCodes}
              readOnly={props.readOnly ?? false}
              allowRemoval={allowRemoval}
              isExistingVacancy={isExistingVacancy}
            />
          ))}
        </div>
        {absenceActions && (
          <div className={classes.absenceActions}>{absenceActions}</div>
        )}
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
        {footerActions && (
          <div className={classes.footerActions}>
            {showAssignAllButton && (
              <FilteredAssignmentButton
                details={vacancySummaryDetails.map(d => {
                  return {
                    id: d.vacancyDetailId,
                    date: d.date,
                    startTime: secondsSinceMidnight(
                      d.startTimeLocal.toISOString()
                    ),
                  };
                })}
                buttonText={
                  isExistingVacancy ? t("Assign Sub") : t("Pre-arrange")
                }
                disableAssign={disableAssignmentActions}
                onClick={onLocalAssignClick}
              />
            )}
            {footerActions}
          </div>
        )}
      </div>
    </>
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
  absenceActions: {
    marginTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  footerActions: {
    marginTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
}));
