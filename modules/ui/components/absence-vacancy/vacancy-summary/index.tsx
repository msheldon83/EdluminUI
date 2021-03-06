import { makeStyles, Typography, TextField, Grid } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { VacancySummaryDetail } from "./types";
import { buildAssignmentGroups } from "./helpers";
import { AssignmentGroup } from "./assignment-group";
import { uniqWith } from "lodash-es";
import { NotReleasedBanner } from "ui/components/absence-vacancy/approval-state/not-released-banner";
import { FilteredAssignmentButton } from "./filtered-assignment-button";
import { canAssignSub } from "helpers/permissions";

type Props = {
  vacancySummaryDetails: VacancySummaryDetail[];
  assignAction?: "assign" | "pre-arrange";
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
  readOnly?: boolean;
  noDaysChosenText?: string;
  showAssignAllButton?: boolean;
  isAbsence?: boolean;
  absenceActions?: JSX.Element;
  footerActions?: JSX.Element;
  allowRemoval?: boolean;
  isApprovedForSubJobSearch: boolean;
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
    showAssignAllButton = false,
    isAbsence = false,
    disableAssignmentActions = false,
    detailsOnly = false,
    absenceActions = null,
    footerActions = null,
    noDaysChosenText = t("No days chosen"),
    allowRemoval = false,
    isApprovedForSubJobSearch,
    assignAction = "assign",
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

  return (
    <>
      <div className={classes.container}>
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
        {!isApprovedForSubJobSearch && (
          <NotReleasedBanner isNormalVacancy={!isAbsence} />
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
              assignAction={assignAction}
              isApprovedForSubJobSearch={isApprovedForSubJobSearch}
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
            {showAssignAllButton && onAssignClick && (
              <FilteredAssignmentButton
                details={vacancySummaryDetails}
                action={assignAction}
                permissionCheck={canAssignSub}
                disableAction={disableAssignmentActions}
                onClick={onAssignClick}
                className={classes.assignAllButton}
                isApprovedForSubJobSearch={isApprovedForSubJobSearch}
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
  assignAllButton: {
    marginRight: theme.spacing(2),
  },
}));
