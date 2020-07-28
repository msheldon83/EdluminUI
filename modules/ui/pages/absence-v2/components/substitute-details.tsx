import * as React from "react";
import {
  makeStyles,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";
import {
  AssignmentFor,
  VacancySummaryDetail,
} from "ui/components/absence-vacancy/vacancy-summary/types";
import { AbsenceFormData, AssignmentOnDate } from "../types";
import { useFormikContext } from "formik";
import {
  AbsenceCreateInput,
  Vacancy,
  NeedsReplacement,
  PermissionEnum,
} from "graphql/server-types.gen";
import { GetProjectedVacancies } from "../graphql/get-projected-vacancies.gen";
import { useQueryBundle } from "graphql/hooks";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { compact } from "lodash-es";
import { convertVacancyToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";
import { SubstituteDetailsCodes } from "./substitute-details-codes";
import { Can } from "ui/components/auth/can";
import { DesktopOnly, MobileOnly } from "ui/components/mobile-helpers";
import { FilteredAssignmentButton } from "ui/components/absence-vacancy/filtered-assignment-button";
import { secondsSinceMidnight } from "helpers/time";
import { isSameDay } from "date-fns";
import { accountingCodeAllocationsAreTheSame } from "helpers/accounting-code-allocations";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import { payCodeIdsAreTheSame } from "ui/components/absence/helpers";

type Props = {
  absenceId?: string;
  organizationId: string;
  actingAsEmployee: boolean;
  needsReplacement: NeedsReplacement;
  locationIds?: string[];
  projectionInput: AbsenceCreateInput | null;
  absenceDates: Date[];
  onAssignSubClick: (
    vacancySummaryDetailsToAssign: VacancySummaryDetail[]
  ) => void;
  onCancelAssignment: (vacancyDetailIds: string[]) => Promise<void>;
  onEditSubDetailsClick: () => void;
  onProjectedVacanciesChange: (vacancies: Vacancy[]) => void;
  onOverallCodeChanges: (details: {
    accountingCodeValue?: AccountingCodeValue;
    payCodeId?: string | null;
  }) => void;
  assignmentsByDate?: AssignmentOnDate[] | undefined;
  disableReplacementInteractions?: boolean;
  vacanciesOverride?: Vacancy[];
};

export const SubstituteDetails: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    absenceId,
    organizationId,
    actingAsEmployee,
    needsReplacement,
    projectionInput,
    absenceDates,
    onAssignSubClick,
    onCancelAssignment,
    onEditSubDetailsClick,
    locationIds,
    onProjectedVacanciesChange,
    onOverallCodeChanges,
    assignmentsByDate,
    vacanciesOverride,
    disableReplacementInteractions = false,
  } = props;
  const { values, setFieldValue } = useFormikContext<AbsenceFormData>();
  const snackbar = useSnackbar();

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: {
        ...projectionInput!,
        ignoreWarnings: true,
      },
      ignoreAbsenceId: absenceId ?? undefined,
    },
    skip: !projectionInput || !!vacanciesOverride,
    onError: error => {
      ShowErrors(error, snackbar.openSnackbar);
    },
  });

  const projectedVacancies = React.useMemo(
    () => {
      const result =
        getProjectedVacancies.state === "LOADING" ||
        getProjectedVacancies.state === "UPDATING" ||
        getProjectedVacancies.state === "ERROR"
          ? []
          : (compact(
              getProjectedVacancies.data?.absence?.projectedVacancies ?? []
            ) as Vacancy[]);
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getProjectedVacancies.state]
  );
  const projectVacanciesLoading = React.useMemo(
    () =>
      projectionInput &&
      (getProjectedVacancies.state === "LOADING" ||
        getProjectedVacancies.state === "UPDATING"),
    [projectionInput, getProjectedVacancies.state]
  );

  React.useEffect(() => {
    if (projectedVacancies.length > 0) {
      onProjectedVacanciesChange(projectedVacancies);
    }
  }, [onProjectedVacanciesChange, projectedVacancies]);

  // Prevent flashes of loading in the Vacancy Summary component by keeping the
  // vacancySummaryDetails in state and only updating them when getProjectedVacancies
  // request has finished loading
  const [vacancySummaryDetails, setVacancySummaryDetails] = React.useState<
    VacancySummaryDetail[]
  >([]);
  React.useEffect(() => {
    if (absenceDates.length === 0) {
      // No dates are currently selected so clear
      // out the Vacancy Summary Details
      setVacancySummaryDetails([]);
    }

    if (vacanciesOverride) {
      setVacancySummaryDetails(
        vacanciesOverride[0]
          ? convertVacancyToVacancySummaryDetails(
              vacanciesOverride[0],
              assignmentsByDate
            )
          : []
      );
      return;
    }

    if (
      getProjectedVacancies.state !== "LOADING" &&
      getProjectedVacancies.state !== "UPDATING"
    ) {
      setVacancySummaryDetails(
        projectedVacancies[0]
          ? convertVacancyToVacancySummaryDetails(
              projectedVacancies[0],
              assignmentsByDate
            )
          : []
      );
    }
  }, [
    getProjectedVacancies.state,
    projectedVacancies,
    assignmentsByDate,
    absenceDates,
    vacanciesOverride,
  ]);

  const detailsHaveDifferentAccountingCodes = React.useMemo(() => {
    const codesAreTheSame = accountingCodeAllocationsAreTheSame(
      vacancySummaryDetails[0]?.accountingCodeAllocations ?? [],
      vacancySummaryDetails?.map(vsd => vsd.accountingCodeAllocations)
    );
    return !codesAreTheSame;
  }, [vacancySummaryDetails]);

  const detailsHaveDifferentPayCodes = React.useMemo(() => {
    const codesAreTheSame = payCodeIdsAreTheSame(
      vacancySummaryDetails.map(vsd => vsd.payCodeId)
    );
    return !codesAreTheSame;
  }, [vacancySummaryDetails]);

  const needsReplacementDisplay: JSX.Element = React.useMemo(() => {
    return (
      <>
        {!actingAsEmployee ||
        needsReplacement === NeedsReplacement.Sometimes ? (
          <FormControlLabel
            label={t("Requires a substitute")}
            control={
              <Checkbox
                checked={values.needsReplacement}
                onChange={e =>
                  setFieldValue("needsReplacement", e.target.checked)
                }
                color="primary"
              />
            }
          />
        ) : (
          <Typography className={classes.substituteRequiredText}>
            {needsReplacement === NeedsReplacement.Yes
              ? t("Requires a substitute")
              : t("No substitute required")}
          </Typography>
        )}
      </>
    );
  }, [
    actingAsEmployee,
    classes.substituteRequiredText,
    needsReplacement,
    setFieldValue,
    t,
    values.needsReplacement,
  ]);

  const absenceActions: JSX.Element = React.useMemo(() => {
    return (
      <>
        {needsReplacementDisplay}
        {values.needsReplacement && !actingAsEmployee && (
          <SubstituteDetailsCodes
            organizationId={organizationId}
            locationIds={locationIds}
            detailsHaveDifferentAccountingCodes={
              detailsHaveDifferentAccountingCodes
            }
            detailsHaveDifferentPayCodes={detailsHaveDifferentPayCodes}
            onOverallCodeChanges={onOverallCodeChanges}
          />
        )}
      </>
    );
  }, [
    actingAsEmployee,
    detailsHaveDifferentAccountingCodes,
    detailsHaveDifferentPayCodes,
    locationIds,
    needsReplacementDisplay,
    onOverallCodeChanges,
    organizationId,
    values.needsReplacement,
  ]);

  const footerActions: JSX.Element = React.useMemo(() => {
    if (vacancySummaryDetails.length === 0) {
      return <></>;
    }

    const hasAssignments = assignmentsByDate && assignmentsByDate.length > 0;

    return (
      <div>
        {!hasAssignments && (
          <FilteredAssignmentButton
            details={vacancySummaryDetails.map(d => {
              return {
                id: d.vacancyDetailId,
                date: d.date,
                startTime: secondsSinceMidnight(d.startTimeLocal.toISOString()),
              };
            })}
            buttonText={absenceId ? t("Assign Sub") : t("Pre-arrange")}
            disableAssign={disableReplacementInteractions}
            onClick={(detailIds, dates) => {
              const detailsToAssign = vacancySummaryDetails.filter(
                d =>
                  detailIds.includes(d.vacancyDetailId) ||
                  dates.find(date => isSameDay(date, d.date))
              );
              onAssignSubClick(detailsToAssign);
            }}
          />
        )}
        <Can do={[PermissionEnum.AbsVacSave]}>
          <Button
            variant="outlined"
            onClick={onEditSubDetailsClick}
            //disabled={props.disableEditingDatesAndTimes}
          >
            <DesktopOnly>{t("Edit Substitute Details")}</DesktopOnly>
            <MobileOnly>{t("Edit Details")}</MobileOnly>
          </Button>
        </Can>
      </div>
    );
  }, [
    assignmentsByDate,
    absenceId,
    onAssignSubClick,
    onEditSubDetailsClick,
    t,
    vacancySummaryDetails,
    disableReplacementInteractions,
  ]);

  return (
    <>
      <div className={classes.substituteDetailsHeader}>
        <Typography className={classes.substituteDetailsTitle} variant="h5">
          {t("Substitute Details")}
        </Typography>
        <Typography className={classes.subText}>
          {t(
            "These times may not match your schedule exactly depending on district configuration."
          )}
        </Typography>
      </div>
      {values.needsReplacement && (
        <VacancySummary
          vacancySummaryDetails={vacancySummaryDetails}
          onAssignClick={(currentAssignmentInfo: AssignmentFor) =>
            onAssignSubClick(currentAssignmentInfo.vacancySummaryDetails)
          }
          onCancelAssignment={onCancelAssignment}
          notesForSubstitute={values.notesToReplacement}
          setNotesForSubstitute={(notes: string) => {
            setFieldValue("notesToReplacement", notes);
          }}
          showPayCodes={false}
          showAccountingCodes={false}
          noDaysChosenText={
            projectVacanciesLoading
              ? t("Loading...")
              : t("Select a Date, Reason, and Times...")
          }
          isAbsence={true}
          absenceActions={absenceActions}
          footerActions={footerActions}
          disableAssignmentActions={disableReplacementInteractions}
        />
      )}
      {!values.needsReplacement && (
        <div className={classes.noReplacementNeeded}>
          {needsReplacementDisplay}
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  substituteDetailsHeader: {
    marginBottom: theme.spacing(2),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  substituteRequiredText: {
    fontStyle: "italic",
  },
  noReplacementNeeded: {
    width: "100%",
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    padding: theme.spacing(2),
  },
  substituteDetailsTitle: { paddingBottom: theme.typography.pxToRem(3) },
}));
