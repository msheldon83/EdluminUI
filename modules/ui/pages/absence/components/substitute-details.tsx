import * as React from "react";
import { makeStyles, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";
import { AbsenceFormData, AssignmentOnDate, VacancyDetail } from "../types";
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
import { compact, sortBy } from "lodash-es";
import { SubstituteDetailsCodes } from "./substitute-details-codes";
import { Can } from "ui/components/auth/can";
import { DesktopOnly, MobileOnly } from "ui/components/mobile-helpers";
import { accountingCodeAllocationsAreTheSame } from "helpers/accounting-code-allocations";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import { payCodeIdsAreTheSame } from "ui/components/absence/helpers";
import { NeedsReplacementCheckbox } from "./needs-replacement";
import { convertVacancyToVacancySummaryDetails } from "../helpers";
import {
  parseISO,
  areIntervalsOverlapping,
  isEqual,
  isSameDay,
} from "date-fns";

type Props = {
  absenceId?: string;
  organizationId: string;
  actingAsEmployee: boolean;
  needsReplacement: NeedsReplacement;
  locationIds?: string[];
  projectionInput: AbsenceCreateInput | null;
  absenceDates: Date[];
  isClosed: boolean;
  onAssignSubClick: (
    vacancySummaryDetailsToAssign: VacancySummaryDetail[]
  ) => void;
  onCancelAssignment: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<boolean>;
  canEditSubDetails: boolean;
  onEditSubDetailsClick: () => void;
  onProjectedVacanciesChange: (vacancies: Vacancy[]) => void;
  onOverallCodeChanges: (details: {
    accountingCodeValue?: AccountingCodeValue;
    payCodeId?: string | null;
  }) => void;
  assignmentsByDate: AssignmentOnDate[];
  disableReplacementInteractions?: boolean;
  vacanciesOverride?: Vacancy[];
  initialVacancyDetails?: VacancyDetail[];
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
    canEditSubDetails,
    onEditSubDetailsClick,
    locationIds,
    onProjectedVacanciesChange,
    onOverallCodeChanges,
    assignmentsByDate,
    vacanciesOverride,
    isClosed,
    initialVacancyDetails,
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
    skip:
      !values.needsReplacement ||
      !projectionInput ||
      !!vacanciesOverride ||
      isClosed,
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
      return;
    }

    const vacancy: Vacancy | undefined =
      vacanciesOverride && vacanciesOverride[0]
        ? vacanciesOverride[0]
        : getProjectedVacancies.state !== "LOADING" &&
          getProjectedVacancies.state !== "UPDATING" &&
          projectedVacancies[0]
        ? projectedVacancies[0]
        : undefined;

    const assignments: AssignmentOnDate[] = [];
    if (initialVacancyDetails && vacancy) {
      // If we have initialVacancyDetails then we're working with an existing
      // Absence. In that case the Assignments displayed are more for visual purposes
      // because once the User changes Absence dates or times, they have to save the
      // whole Absence before they can interact with any Assignment actions. If they
      // do change times, we just want to make sure to keep displaying the current
      // Assignments correctly.
      const initialAssignedVacancyDetails = initialVacancyDetails
        ? sortBy(
            initialVacancyDetails
              .filter(vd => !!vd.assignmentId)
              .map(vd => {
                return {
                  ...vd,
                  startTimeLocal: parseISO(vd.startTime),
                  endTimeLocal: parseISO(vd.endTime),
                };
              }),
            vd => vd.startTimeLocal
          )
        : [];
      const allDetailTimes = compact(
        vacancy.details?.map(d =>
          d
            ? {
                startTimeLocal: parseISO(d.startTimeLocal),
                endTimeLocal: parseISO(d.endTimeLocal),
              }
            : undefined
        )
      );
      allDetailTimes.forEach(a => {
        // Find a projected detail that matches either
        // exactly or on start time
        let match = initialAssignedVacancyDetails.find(
          vd =>
            (isEqual(a.startTimeLocal, vd.startTimeLocal) &&
              isEqual(a.endTimeLocal, vd.endTimeLocal)) ||
            isEqual(a.startTimeLocal, vd.startTimeLocal)
        );
        if (!match) {
          // Fallback to matching on an overlap or same day check
          match = initialAssignedVacancyDetails.find(
            vd =>
              areIntervalsOverlapping(
                { start: a.startTimeLocal, end: a.endTimeLocal },
                { start: vd.startTimeLocal, end: vd.endTimeLocal }
              ) || isSameDay(a.startTimeLocal, vd.startTimeLocal)
          );
        }
        if (match) {
          assignments.push({
            startTimeLocal: a.startTimeLocal,
            endTimeLocal: a.endTimeLocal,
            vacancyDetailId: match.vacancyDetailId,
            assignmentId: match.assignmentId,
            assignmentRowVersion: match.assignmentRowVersion,
            employee: {
              id: match.assignmentEmployeeId ?? "0",
              firstName: match.assignmentEmployeeFirstName ?? "",
              lastName: match.assignmentEmployeeLastName ?? "",
              email: match.assignmentEmployeeEmail,
            },
          });
        }
      });
    } else {
      assignments.push(...assignmentsByDate);
    }

    if (vacanciesOverride && vacancy) {
      setVacancySummaryDetails(
        convertVacancyToVacancySummaryDetails(vacancy, assignments)
      );
      return;
    }

    if (
      getProjectedVacancies.state !== "LOADING" &&
      getProjectedVacancies.state !== "UPDATING" &&
      vacancy
    ) {
      setVacancySummaryDetails(
        convertVacancyToVacancySummaryDetails(vacancy, assignments)
      );
      return;
    }
  }, [
    getProjectedVacancies.state,
    projectedVacancies,
    assignmentsByDate,
    absenceDates,
    vacanciesOverride,
    initialVacancyDetails,
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

  const needsReplacementDisplay = React.useMemo(() => {
    return (
      <NeedsReplacementCheckbox
        actingAsEmployee={actingAsEmployee}
        needsReplacement={needsReplacement}
        value={values.needsReplacement}
        onChange={checked => setFieldValue("needsReplacement", checked)}
        disabled={isClosed}
      />
    );
  }, [
    actingAsEmployee,
    isClosed,
    needsReplacement,
    setFieldValue,
    values.needsReplacement,
  ]);

  const isApprovedForSubJobSearch = React.useMemo(() => {
    if (vacanciesOverride) {
      return vacanciesOverride[0]
        ? vacanciesOverride[0].isApprovedForSubJobSearch
        : true;
    } else if (
      getProjectedVacancies.state !== "LOADING" &&
      getProjectedVacancies.state !== "UPDATING"
    ) {
      // projected vacancies will be empty if this absence is on an inservice day
      // If so, there will be no vacancy so it will never be released to subs
      return projectedVacancies[0]
        ? projectedVacancies[0].isApprovedForSubJobSearch
        : true;
    }
    return true;
  }, [getProjectedVacancies, projectedVacancies, vacanciesOverride]);

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
          onAssignClick={async (
            vacancySummaryDetails: VacancySummaryDetail[]
          ) => onAssignSubClick(vacancySummaryDetails)}
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
          footerActions={
            vacancySummaryDetails.length > 0 ? (
              <Can do={[PermissionEnum.AbsVacSave]}>
                <Button
                  variant="outlined"
                  onClick={onEditSubDetailsClick}
                  disabled={!canEditSubDetails}
                >
                  <DesktopOnly>{t("Edit Substitute Details")}</DesktopOnly>
                  <MobileOnly>{t("Edit Details")}</MobileOnly>
                </Button>
              </Can>
            ) : (
              undefined
            )
          }
          disableAssignmentActions={disableReplacementInteractions}
          allowRemoval={!absenceId}
          isApprovedForSubJobSearch={isApprovedForSubJobSearch}
          showAssignAllButton={
            vacancySummaryDetails.length !== 0 &&
            (!assignmentsByDate || assignmentsByDate.length === 0)
          }
          assignAction={absenceId ? "assign" : "pre-arrange"}
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
  noReplacementNeeded: {
    width: "100%",
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    padding: theme.spacing(2),
  },
  substituteDetailsTitle: { paddingBottom: theme.typography.pxToRem(3) },
}));
