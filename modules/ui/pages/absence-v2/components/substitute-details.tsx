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
import { NeedsReplacementCheckbox } from "./needs-replacement";

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
          showAssignAllButton={
            vacancySummaryDetails.length !== 0 &&
            (!assignmentsByDate || assignmentsByDate.length === 0)
          }
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
